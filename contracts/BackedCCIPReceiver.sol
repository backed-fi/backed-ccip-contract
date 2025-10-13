// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { Bytes } from "@openzeppelin/contracts/utils/Bytes.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

import {CCIPReceiverUpgradeable} from "./ccip-upgradeable/CCIPReceiverUpgradeable.sol";
import {IBackedAutoFeeTokenImplementation} from './interfaces/IBackedAutoFeeTokenImplementation.sol';

/**
* @dev
* The BackedCCIPReceiver contract is designed to facilitate cross-chain token transfers and messaging using Chainlink's Cross-Chain Interoperability Protocol (CCIP).
* It allows users to send tokens to a custody wallet on the source chain and receive equivalent tokens on the destination chain, leveraging CCIP to relay messages between chains.
* This contract assumes that custody wallet approval for this contract to transfer tokens will be managed off-chain.
*/

contract BackedCCIPReceiver is CCIPReceiverUpgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;
    using Bytes for bytes;

    /// CCIP message consumption fail that we should not revert and consume messages.
    enum InvalidMessageReason {
        SOURCE_CHAIN_SELECTOR_NOT_ALLOWLISTED,
        SOURCE_SENDER_NOT_ALLOWLISTED,
        TOKEN_NOT_REGISTERED,
        TOKEN_RECEIVER_INVALID,
        MULTIPLIER_MISMATCH,
        TRANSFER_FAILED
    }

    /// Variants of chains that are supported by this bridge.
    enum ChainVariant {
        EVM,
        SVM
    }

    // Custom errors to provide more descriptive revert messages.
    error InsufficientMessageValue(uint256 value, uint256 calculatedFees); // Used to make sure client has sent enough to cover the fees.
    error NothingToWithdraw(); // Used when trying to withdraw but there's nothing to withdraw.
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Ether fails.
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector); // Used when the destination chain has not been allowlisted by the contract owner.
    error SourceChainNotAllowlisted(uint64 sourceChainSelector); // Used when the source chain has not been allowlisted by the contract owner.
    error SenderNotAllowlisted(address sender); // Used when the sender has not been allowlisted by the contract owner.
    error InvalidAddress(); // Used when the address is 0.
    error TokenNotRegistered(address token); // Used when the token has not been registered by the contract owner.
    error InvalidTokenId(); // Used when token id is zero address or already registered.
    error InvalidTokenAddress(); // Used when token address is zero address or already registered.
    error InvalidMultiplierNonce(); // Used when source chain multiplier nonce is ahead of current chain nonce.

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        bytes32 receiver, // The address of the CCIP message receiver on the destination chain. 
        bytes32 tokenReceiver, // The address of the token receiver on the destination chain
        uint64 tokenId, // The token being sent.
        uint256 sharesAmount // The shares amount being sent.
    );

    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        bytes32 sender, // The address of the sender from the source chain.
        address token, // The token that was received.
        uint256 sharesAmount, // The shares amount that was received.
        address tokenReceiver // The receiver of the tokens.
    );

    event InvalidMessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        InvalidMessageReason reason // The reason why ccip message consume was skipped
    );

    event DestinationChainRegistered(
        uint64 destinationChainSelector, // The selector of the destination chain
        bytes32 destinationChainReceiver // The receiver of the CCIP message on the destination chain
    );

    event DestinationChainRemoved(
        uint64 destinationChainSelector // The selector of the destination chain
    );

    event SourceChainRegistered(
        uint64 sourceChainSelector, // The selector of the source chain
        bytes32 sourceChainSender // The address of the CCIP message sender on the source chain
    );

    event SourceChainRemoved(
        uint64 sourceChainSelector // The selector of the source chain
    );

    event CustodyWalletUpdated(
        address newCustodywallet // The address of new custody wallet.
    );

    event GasLimitUpdated(
        uint64 chainId, // The identifier (aka selector) for the destination blockchain
        uint256 newGasLimit // CCIP execution gas limit on destination chain
    );

    event TokenRegistered(
        address token, // The address of the token
        uint64 tokenId
    );

    event TokenRemoved(
        address token, // The address of the token
        uint64 tokenId
    );

    struct TokenInfo {
        uint64 id;
    }

    struct ChainInfo {
        ChainVariant variant;
        uint256 defaultGasLimit;
    }

    address private _custodyWallet; // Custody wallet.

    // Mapping to keep track of allowlisted destination chains and it's receiver addresses.
    mapping(uint64 => bytes32) public allowlistedDestinationChains;

    // Mapping to keep track of allowlisted source chains and it's sender addresses.
    mapping(uint64 => bytes32) public allowlistedSourceChains;

    // Mapping from chain id to chain information.
    mapping(uint64 => ChainInfo) public chainInfos;

    // Mapping from token address to token information.
    mapping(address => TokenInfo) public tokenInfos;
    // Mapping from tokenId to token address
    mapping(uint64 => address) public tokens;

    /// @notice BackedCCIPReceiver constructor; prevent initialize() from being invoked on the implementation contract
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Constructor initializes the contract with the router address.
    /// @param _router The address of the router contract.
    /// @param _custody The address of the custody wallet.
    function initialize(address _router, address _custody) public initializer  {
        __CCIPReceiverUpgradeable_init(_router);
        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();

        updateCustodyWallet(_custody);
    }

    /// @dev Modifier that checks if the chain with the given destinationChainSelector is allowlisted.
    /// @param _destinationChainSelector The selector of the destination chain.
    modifier onlyAllowlistedDestinationChain(uint64 _destinationChainSelector) {
        if (allowlistedDestinationChains[_destinationChainSelector] == bytes32(0))
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        _;
    }

    /// @dev Modifier that checks if the chain with the given _sourceChainSelector is allowlisted.
    /// @param _sourceChainSelector The selector of the source chain.
    modifier onlyAllowlistedSourceChain(uint64 _sourceChainSelector) {
        if (allowlistedSourceChains[_sourceChainSelector] == bytes32(0))
            revert SourceChainNotAllowlisted(_sourceChainSelector);
        _;
    }

    /// @dev Modifier that checks if token is registered
    /// @param _token The address of the token.
    modifier onlyAllowRegisteredTokens(address _token) {
        if (_token == address(0))
            revert InvalidTokenAddress();

        if (tokenInfos[_token].id == 0)
            revert TokenNotRegistered(_token);
        _;
    }

    /// @dev Modifier that checks the address is not zero address.
    /// @param _address The address to be registered.
    modifier validateAddress(bytes32 _address) {
        if (_address == bytes32(0)) revert InvalidAddress();
        _;
    }

    /// @dev Modifier that checks the token address is not zero address or is not registered.
    /// @param _token The token address.
    modifier validateToken(address _token) {
        if (_token == address(0) || tokenInfos[_token].id != 0) 
            revert InvalidTokenAddress();
        _;
    }

    /// @dev Modifier that checks the _tokenId not 0 and is not registered.
    /// @param _tokenId The arbitrary id of the token.
    modifier validateTokenId(uint64 _tokenId) {
        if (_tokenId == 0 || tokens[_tokenId] != address(0)) 
            revert InvalidTokenId();
        _;
    }

    /// @dev Returns the address of the current custody wallet.
    function custodyWallet() public view virtual returns (address) {
        return _custodyWallet;
    }

    /// @dev Returns the default gas limit.
    function gasLimit(uint64 _chainId) public view virtual returns (uint256) {
        return chainInfos[_chainId].defaultGasLimit;
    }

    /// @dev Adds _destinationChainSelector the the allowlist and registers receiver address.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _destinationChainReceiver The address of the CCIP receiver on the destination blockchain.
    /// @param _destinationChainVariant The variant of the destination chain.
    /// @param _destinationDefaultGasLimit The default gas limit for the destination chain.
    function registerDestinationChain(uint64 _destinationChainSelector, bytes32 _destinationChainReceiver, ChainVariant _destinationChainVariant, uint256 _destinationDefaultGasLimit) 
        external 
        onlyOwner
        validateAddress(_destinationChainReceiver)
    {
        allowlistedDestinationChains[_destinationChainSelector] = _destinationChainReceiver;
        chainInfos[_destinationChainSelector] = ChainInfo(_destinationChainVariant, _destinationDefaultGasLimit);

        emit DestinationChainRegistered(_destinationChainSelector, _destinationChainReceiver);
    }

    /// @dev Removes _destinationChainSelector from the allowlist.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    function removeDestinationChain(uint64 _destinationChainSelector)
        external
        onlyOwner
        onlyAllowlistedDestinationChain(_destinationChainSelector)
    {
        allowlistedDestinationChains[_destinationChainSelector] = bytes32(0);
        delete chainInfos[_destinationChainSelector];

        emit DestinationChainRemoved(_destinationChainSelector);
    }

    /// @dev Adds _sourceChainSelector the the allowlist and registers sender address.
    /// @param _sourceChainSelector The identifier (aka selector) of the source blockchain.
    /// @param _sourceChainSender The address of the CCIP sender on the source blockchain.
    function registerSourceChain(uint64 _sourceChainSelector, bytes32 _sourceChainSender) 
        external 
        onlyOwner
        validateAddress(_sourceChainSender)
    {
        allowlistedSourceChains[_sourceChainSelector] = _sourceChainSender;

        emit SourceChainRegistered(_sourceChainSelector, _sourceChainSender);
    }
   
    /// @dev Removes _sourceChainSelector from the allowlist.
    /// @param _sourceChainSelector The identifier (aka selector) for the source blockchain.
    function removeSourceChain(uint64 _sourceChainSelector) 
        external 
        onlyOwner
        onlyAllowlistedSourceChain(_sourceChainSelector)
    {
        allowlistedSourceChains[_sourceChainSelector] = bytes32(0);

        emit SourceChainRemoved(_sourceChainSelector);
    }

    /// @dev Updates the allowlist status of a _token under _tokenId.
    /// @param _token The address of the token.
    /// @param _tokenId The arbitrary id of the the token.
    function registerToken(address _token, uint64 _tokenId) 
        external
        onlyOwner
        validateToken(_token)
        validateTokenId(_tokenId)
    {
        tokenInfos[_token] = TokenInfo(_tokenId);
        tokens[_tokenId] = _token;

        emit TokenRegistered(_token, _tokenId);
    }

    /// @dev Removes token from the allowlist.
    /// @param _token The address of the token.
    function removeToken(address _token) 
        external
        onlyOwner
        onlyAllowRegisteredTokens(_token)
    {
        TokenInfo memory tokenInfo = tokenInfos[_token];

        tokens[tokenInfo.id] = address(0);
        delete tokenInfos[_token];

        emit TokenRemoved(_token, tokenInfo.id);
    }

    /// @dev Updates the custody wallet.
    /// @param _custody new custody wallet address
    function updateCustodyWallet(address _custody) 
        public 
        onlyOwner 
    {
        _custodyWallet = _custody;

        emit CustodyWalletUpdated(_custody);
    }

    /// @dev Updates default gas limit for CCIP.
    /// @param _chainId The identifier (aka selector) for the destination blockchain.
    /// @param _gasLimit New default gas limit
    function updateGasLimit(uint64 _chainId, uint256 _gasLimit)
        public 
        onlyOwner 
    {
        chainInfos[_chainId].defaultGasLimit = _gasLimit;

        emit GasLimitUpdated(_chainId, _gasLimit);
    }

    /// @notice Sends tokens to custody wallet and sends information to destination chain.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _tokenReceiver The address that will be receiver of the tokens on destination blockchain.
    /// @param _token The address of the token to be sent.
    /// @param _amount The amount to be sent.
    /// @param _chainSpecificArgs Additional arguments specific to the destination chain variant.
    function send(uint64 _destinationChainSelector, bytes32 _tokenReceiver, address _token, uint256 _amount, bytes calldata _chainSpecificArgs)
        external
        payable
        whenNotPaused
        onlyAllowlistedDestinationChain(_destinationChainSelector)
        onlyAllowRegisteredTokens(_token)
        returns (bytes32 messageId)
    {
        IERC20(_token).safeTransferFrom(
            msg.sender, _custodyWallet, _amount
        );

        TokenInfo memory tokenInfo = tokenInfos[_token];
        bytes32 receiver = allowlistedDestinationChains[_destinationChainSelector];
        uint256 defaultGasLimit = chainInfos[_destinationChainSelector].defaultGasLimit;

        uint256 _sharesAmount = IBackedAutoFeeTokenImplementation(_token).getSharesByUnderlyingAmount(_amount);

        messageId = _sendMessagePayNative(
            _destinationChainSelector,
            receiver,
            abi.encodePacked(_tokenReceiver, tokenInfo.id, _sharesAmount),
            defaultGasLimit, 
            _chainSpecificArgs
        );

        // Emit an event with message details
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            receiver,
            _tokenReceiver,
            tokenInfo.id,
            _sharesAmount
        );
    }

    /// @notice Returns the calculated delivery fee on the given `_destinationChainSelector`
    /// @param _destinationChainSelector: The identifier (aka selector) for the destination blockchain.
    /// @param _tokenReceiver The address that will be receiver of the tokens on destination blockchain.
    /// @param _token The address of the token to sent.
    /// @param _amount The amount to be sent.
    /// @return The calculated delivery fee cost
    function getDeliveryFeeCost(uint64 _destinationChainSelector, bytes32 _tokenReceiver, address _token, uint256 _amount, bytes calldata _chainSpecificArgs) external view returns (uint256) {
        bytes32 receiver = allowlistedDestinationChains[_destinationChainSelector];
        TokenInfo memory tokenInfo = tokenInfos[_token];
        ChainInfo memory chainInfo = chainInfos[_destinationChainSelector];
        
        bytes memory data;

        uint256 sharesAmount = IBackedAutoFeeTokenImplementation(_token).getSharesByUnderlyingAmount(_amount);

        data = abi.encodePacked(_tokenReceiver, tokenInfo.id, sharesAmount);

        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            receiver,
            data,
            chainInfo.defaultGasLimit,
            chainInfo.variant,
            _chainSpecificArgs
        );

        return _getDeliveryCost(_destinationChainSelector, evm2AnyMessage);
    }

    function _getDeliveryCost(uint64 _destinationChainSelector, Client.EVM2AnyMessage memory _evm2AnyMessage) internal view returns (uint256) {
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        return router.getFee(_destinationChainSelector, _evm2AnyMessage);
    }

    /// @notice Sends data to receiver on the destination chain.
    /// @notice Pay for fees in native gas.
    /// @dev Assumes your contract has sufficient native gas tokens.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _receiver The address of the recipient of the message on the destination blockchain.
    /// @param _data ABI encoded CCIP message data.
    /// @param _gasLimit Gas limit for transaction on destination chain.
    /// @param _chainSpecificArgs Additional arguments specific to the destination chain variant.
    /// @return messageId The ID of the CCIP message that was sent.
    function _sendMessagePayNative(
        uint64 _destinationChainSelector,
        bytes32 _receiver,
        bytes memory _data,
        uint256 _gasLimit,
        bytes calldata _chainSpecificArgs
    )
        internal
        returns (bytes32 messageId)
    {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _data,
            _gasLimit,
            chainInfos[_destinationChainSelector].variant,
            _chainSpecificArgs
        );

        uint256 fees = _getDeliveryCost(_destinationChainSelector, evm2AnyMessage);

        if (fees > msg.value)
            revert InsufficientMessageValue(msg.value, fees);

       // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());
        
        // Send the CCIP message through the router and store the returned CCIP message ID
        messageId = router.ccipSend{value: fees}(
            _destinationChainSelector,
            evm2AnyMessage
        );

        // Return the CCIP message ID
        return messageId;
    }

    /// @notice This function assumes that the approval for token transfers from custody wallet is properly managed off-chain.
    /// @notice Handles received CCIP message, sents out encoded token transfer from custody wallet to receiver.
    /// @notice We do not revert in some cases and succesfully consume CCIP messages to not allow retries.
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
        nonReentrant
    {
        if (allowlistedSourceChains[any2EvmMessage.sourceChainSelector] == bytes32(0)) {
            emit InvalidMessageReceived(any2EvmMessage.messageId, InvalidMessageReason.SOURCE_CHAIN_SELECTOR_NOT_ALLOWLISTED);
            
            return;
        }

        bytes32 tokenReceiverBytes = bytes32(any2EvmMessage.data.slice(0, 32));
        uint64 tokenId = uint64(bytes8(any2EvmMessage.data.slice(32, 40)));
        uint256 sharesAmount = uint256(bytes32(any2EvmMessage.data.slice(40, 72)));

        if (allowlistedSourceChains[any2EvmMessage.sourceChainSelector] != abi.decode(any2EvmMessage.sender, (bytes32))) {
            emit InvalidMessageReceived(any2EvmMessage.messageId, InvalidMessageReason.SOURCE_SENDER_NOT_ALLOWLISTED);
            
            return;
        }

        address token = tokens[tokenId];

        if (token == address(0)) {
            emit InvalidMessageReceived(any2EvmMessage.messageId, InvalidMessageReason.TOKEN_NOT_REGISTERED);
            
            return;
        }

        address tokenReceiver = _bytes32ToAddress(tokenReceiverBytes);
        
        if (tokenReceiver == address(0)) {
            emit InvalidMessageReceived(any2EvmMessage.messageId, InvalidMessageReason.TOKEN_RECEIVER_INVALID);
            
            return;
        }

        if(!IBackedAutoFeeTokenImplementation(token).transferSharesFrom(
            _custodyWallet, tokenReceiver, sharesAmount
        )) {
            emit InvalidMessageReceived(any2EvmMessage.messageId, InvalidMessageReason.TRANSFER_FAILED);
            return;
        }

        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector, // fetch the source chain identifier (aka selector)
            abi.decode(any2EvmMessage.sender, (bytes32)), // abi-decoding of the sender address,
            token,
            sharesAmount,
            tokenReceiver
        );
    }

    /// @notice Construct a CCIP message.
    /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for sending a text.
    /// @param _receiver The address of the message receiver. 
    /// @param _data ABI encoded message CCIP payload.
    /// @param _gasLimit Gas limit for transaction on destination chain
    /// @param _chainVariant The chain variant for the destination chain
    /// @param _chainSpecificArgs Additional arguments specific to the destination chain variant
    /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    function _buildCCIPMessage(
        bytes32 _receiver,
        bytes memory _data,
        uint256 _gasLimit,
        ChainVariant _chainVariant,
        bytes memory _chainSpecificArgs
    ) private pure returns (Client.EVM2AnyMessage memory) {
        bytes memory extraArgs;
        if(_chainVariant == ChainVariant.EVM) {
            extraArgs = Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: _gasLimit})
            );
        } else if(_chainVariant == ChainVariant.SVM) {
            (uint64 _accountIsWritableBitmap, bytes32[] memory _accounts) = abi.decode(_chainSpecificArgs, (uint64, bytes32[]));
            extraArgs = Client._svmArgsToBytes(Client.SVMExtraArgsV1({
                computeUnits: uint32(_gasLimit),
                accountIsWritableBitmap: _accountIsWritableBitmap,
                allowOutOfOrderExecution: true,
                tokenReceiver: bytes32(0),
                accounts: _accounts
            }));
        }
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: _data, // ABI-encoded message data
                tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array as no tokens are transferred
                extraArgs: extraArgs,
                feeToken: address(0)
            });
    }

    /// @notice Allows the contract owner to withdraw the entire balance of Ether from the contract.
    /// @dev This function reverts if there are no funds to withdraw or if the transfer fails.
    /// It should only be callable by the owner of the contract.
    /// @param _beneficiary The address to which the Ether should be sent.
    function withdraw(address _beneficiary) external onlyOwner {
        // Retrieve the balance of this contract
        uint256 amount = address(this).balance;

        // Revert if there is nothing to withdraw
        if (amount == 0) revert NothingToWithdraw();

        // Attempt to send the funds, capturing the success status and discarding any return data
        (bool sent, ) = _beneficiary.call{value: amount}("");

        // Revert if the send failed, with information about the attempted transfer
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    /// @notice Allows the owner of the contract to withdraw all tokens of a specific ERC20 token.
    /// @dev This function reverts with a 'NothingToWithdraw' error if there are no tokens to withdraw.
    /// @param _beneficiary The address to which the tokens will be sent.
    /// @param _token The contract address of the ERC20 token to be withdrawn.
    function withdrawToken(
        address _beneficiary,
        address _token
    ) external onlyOwner {
        // Retrieve the balance of this contract
        uint256 amount = IERC20(_token).balanceOf(address(this));

        // Revert if there is nothing to withdraw
        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
    }

    /// @notice Pauses the contract
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Pauses the contract
    function unpause() external onlyOwner {
        _unpause();
     }
     
    /// @notice Convert bytes32 to address (truncate to 20 bytes)
    function _bytes32ToAddress(bytes32 input) private pure returns (address) {
        return address(uint160(uint256(input)));
    }
}