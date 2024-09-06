// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

import {CCIPReceiverUpgradeable} from "./ccip-upgradeable/CCIPReceiverUpgradeable.sol";

import "./structs/BackedTransferMessageStruct.sol";

/**
* @dev
* The BackedCCIPReceiver contract is designed to facilitate cross-chain token transfers and messaging using Chainlink's Cross-Chain Interoperability Protocol (CCIP).
* It allows users to send tokens to a custody wallet on the source chain and receive equivalent tokens on the destination chain, leveraging CCIP to relay messages between chains.
* This contract assumes that custody wallet approval for this contract to transfer tokens will be managed off-chain.
*/

contract BackedCCIPReceiver is Initializable, CCIPReceiverUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    // Custom errors to provide more descriptive revert messages.
    error InsufficientMessageValue(uint256 value, uint256 calculatedFees); // Used to make sure client has sent enough to cover the fees.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Ether fails.
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector); // Used when the destination chain has not been allowlisted by the contract owner.
    error SourceChainNotAllowlisted(uint64 sourceChainSelector); // Used when the source chain has not been allowlisted by the contract owner.
    error SenderNotAllowlisted(address sender); // Used when the sender has not been allowlisted by the contract owner.
    error InvalidReceiverAddress(); // Used when the receiver address is 0.
    error TokenNotRegistered(address token); // Used when the token has not been registered by the contract owner.
    error InvalidTokenId(); // Used when token id is 0.
    error InvalidTokenAddress(); // Used when token address is 0.

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        uint64 tokenId, // The token being sent.
        uint256 amount, // The amount being sent.
        uint256 fees // The fees paid for sending the CCIP message.
    );

    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        address token, // The token that was received.
        uint256 amount, // The amount that was received.
        address receiver // The receiver of the tokens.
    );

    event CustodyWalletUpdated(
        address newCustodywallet // The address of new custody wallet.
    );

    event GasLimitUpdated(
        uint256 newGasLimit // CCIP execution gas limit on destination chain
    );

    event TokenRegistered(
        address token, // The address of the token
        uint64 tokenId
    );

    BackedStructs.BackedTransferMessageStruct private lastReceivedMessage;

    address private _custodyWallet; // Custody wallet.
    uint256 private _defaultGasLimitOnDestinationChain; // Gas limit for CCIP execution on destination chain

    // Mapping to keep track of allowlisted destination chains.
    mapping(uint64 => address) public allowlistedDestinationChains;

    // Mapping to keep track of allowlisted source chains.
    mapping(uint64 => bool) public allowlistedSourceChains;

    // Mapping to keep track of allowlisted senders.
    mapping(address => bool) public allowlistedSenders;

    // Mapping from token address to tokenId.
    mapping(address => uint64) public tokenIds;
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
    /// @param _gasLimit Initial value for default CCIP execution gas limit on destination chain.
    function initialize(address _router, address _custody, uint256 _gasLimit) public initializer  {
        __CCIPReceiverUpgradeable_init(_router);
        __Ownable_init();
        __ReentrancyGuard_init();

        _custodyWallet = _custody;
        _defaultGasLimitOnDestinationChain = _gasLimit;
    }

    /// @dev Modifier that checks if the chain with the given destinationChainSelector is allowlisted.
    /// @param _destinationChainSelector The selector of the destination chain.
    modifier onlyAllowlistedDestinationChain(uint64 _destinationChainSelector) {
        if (allowlistedDestinationChains[_destinationChainSelector] == address(0))
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        _;
    }

    /// @dev Modifier that checks if the chain with the given sourceChainSelector is allowlisted and if the sender is allowlisted.
    /// @param _sourceChainSelector The selector of the destination chain.
    /// @param _sender The address of the sender.
    modifier onlyAllowlisted(uint64 _sourceChainSelector, address _sender) {
        if (!allowlistedSourceChains[_sourceChainSelector])
            revert SourceChainNotAllowlisted(_sourceChainSelector);
        if (!allowlistedSenders[_sender]) revert SenderNotAllowlisted(_sender);
        _;
    }

    /// @dev Modifier that checks if token is registered
    /// @param _token The address of the token.
    modifier onlyAllowRegisteredTokens(address _token) {
        if (_token == address(0))
            revert InvalidTokenAddress();

        if (tokenIds[_token] == 0)
            revert TokenNotRegistered(_token);
        _;
    }

    /// @dev Modifier that checks the receiver address is not 0.
    /// @param _receiver The receiver address.
    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }

    /// @dev Returns the address of the current custody wallet.
    function custodyWallet() public view virtual returns (address) {
        return _custodyWallet;
    }

    /// @dev Returns the default gas limit.
    function gasLimit() public view virtual returns (uint256) {
        return _defaultGasLimitOnDestinationChain;
    }

    /// @dev Updates the allowlist status of a destination chain for transactions.
    function registerDestinationChain(uint64 _destinationChainSelector, address _receiver) external onlyOwner {
        allowlistedDestinationChains[_destinationChainSelector] = _receiver;
    }

    /// @dev Updates the allowlist status of a source chain for transactions.
    function allowlistSourceChain(uint64 _sourceChainSelector, bool _allowed ) external onlyOwner {
        allowlistedSourceChains[_sourceChainSelector] = _allowed;
    }

    /// @dev Updates the allowlist status of a sender for transactions.
    function allowlistSender(address _sender, bool _allowed) external onlyOwner {
        allowlistedSenders[_sender] = _allowed;
    }

    /// @dev Updates the allowlist status of a sender for transactions.
    function registerToken(address _token, uint64 _tokenId) external onlyOwner {
        if (_tokenId == 0) revert InvalidTokenId();

        tokenIds[_token] = _tokenId;
        tokens[_tokenId] = _token;

        emit TokenRegistered(_token, _tokenId);
    }

    /// @dev Updates the custody wallet.
    /// @param _custody new custody wallet address
    function updateCustodyWallet(address _custody) external onlyOwner {
        _custodyWallet = _custody;

        emit CustodyWalletUpdated(_custody);
    }

    /// @dev Updates default gas limit for CCIP.
    /// @param _gasLimit New default gas limit
    function updateGasLimit(uint256 _gasLimit) external onlyOwner {
        _defaultGasLimitOnDestinationChain = _gasLimit;

        emit GasLimitUpdated(_gasLimit);
    }

    /// @notice Sends tokens to custody wallet and sends information to destination chain.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _token The address of the token to sent.
    /// @param _amount The amount to be sent.
    function send(uint64 _destinationChainSelector, address _token, uint256 _amount)
        external
        payable
        onlyAllowlistedDestinationChain(_destinationChainSelector)
        onlyAllowRegisteredTokens(_token)
        returns (bytes32 messageId)
    {
       return _send(_destinationChainSelector, _token, _amount, _defaultGasLimitOnDestinationChain);
    }

    /// @notice Sends tokens to custody wallet and sends information to destination chain with custom gas limit settings.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _token The address of the token to sent.
    /// @param _amount The amount to be sent.
    /// @param _customGasLimit Custom gas limit for CCIP
    function sendWithCustomDestinationGasLimit(uint64 _destinationChainSelector, address _token, uint256 _amount,uint256 _customGasLimit
    )
        external
        payable
        onlyAllowlistedDestinationChain(_destinationChainSelector)
        onlyAllowRegisteredTokens(_token)
        returns (bytes32 messageId)
    {
        return _send(_destinationChainSelector, _token, _amount, _customGasLimit);
    }

    /// @notice Returns the calculated delivery fee on the given `_destinationChainSelector`
    /// @param _destinationChainSelector: The identifier (aka selector) for the destination blockchain.
    /// @param _token The address of the token to sent.
    /// @param _amount The amount to be sent.
    /// @return The calculated delivery fee cost
    function getDeliveryFeeCost(uint64 _destinationChainSelector, address _token, uint256 _amount) public view returns (uint256) {
        return _getDeliveryFeeCost(_destinationChainSelector, _token, _amount, _defaultGasLimitOnDestinationChain);
    }

    /// @notice Returns the calculated delivery fee on the given `_destinationChainSelector` and using `_customGasLimit`
    /// @param _destinationChainSelector: The identifier (aka selector) for the destination blockchain.
    /// @param _token The address of the token to sent.
    /// @param _amount The amount to be sent.
    /// @param _customGasLimit Custom CCIP gas limit
    /// @return The calculated delivery fee cost
    function getDeliveryFeeCostWithCustomGasLimit(uint64 _destinationChainSelector, address _token, uint256 _amount, uint256 _customGasLimit) public view returns (uint256) {
        return _getDeliveryFeeCost(_destinationChainSelector, _token, _amount, _customGasLimit);
    }

    function _getDeliveryFeeCost(uint64 _destinationChainSelector, address _token, uint256 _amount, uint256 _gasLimit) internal view returns (uint256) {
        address receiver = allowlistedDestinationChains[_destinationChainSelector];
        uint64 tokenId = tokenIds[_token];

        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            receiver,
            msg.sender,
            tokenId,
            _amount,
            _gasLimit
        );

        return _getDeliveryCost(_destinationChainSelector, evm2AnyMessage);
    }

    function _getDeliveryCost(uint64 _destinationChainSelector, Client.EVM2AnyMessage memory _evm2AnyMessage) internal view returns (uint256) {
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        return router.getFee(_destinationChainSelector, _evm2AnyMessage);
    }

    /// @notice Sends tokens to custody wallet and sends information to destination chain.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _token The address of the token to sent.
    /// @param _amount The amount to be sent.
    /// @param _gasLimit Gas limit for CCIP
    function _send(uint64 _destinationChainSelector, address _token, uint256 _amount, uint256 _gasLimit)
        internal
        returns (bytes32 messageId) 
    {
        IERC20(_token).safeTransferFrom(
            msg.sender, _custodyWallet, _amount
        );

        uint64 tokenId = tokenIds[_token];
        address receiver = allowlistedDestinationChains[_destinationChainSelector];
        if (receiver == address(0)) revert InvalidReceiverAddress();

        return _sendMessagePayNative(_destinationChainSelector, receiver, msg.sender, tokenId, _amount, _gasLimit);
    }

    /// @notice Sends data to receiver on the destination chain.
    /// @notice Pay for fees in native gas.
    /// @dev Assumes your contract has sufficient native gas tokens.
    /// @param _destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param _receiver The address of the recipient of the message on the destination blockchain.
    /// @param _tokenReceiver The address of the recipient of the token on the destination blockchain.
    /// @param _tokenId The arbitrary id of the token to be received on the destination blockchain.
    /// @param _amount The amount to be received on the destination blockchain.
    /// @return messageId The ID of the CCIP message that was sent.
    function _sendMessagePayNative(
        uint64 _destinationChainSelector,
        address _receiver,
        address _tokenReceiver,
        uint64 _tokenId,
        uint256 _amount,
        uint256 _gasLimit
    )
        internal
        returns (bytes32 messageId)
    {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _tokenReceiver,
            _tokenId,
            _amount,
            _gasLimit
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

        // Emit an event with message details
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            _tokenId,
            _amount,
            fees
        );

        // Return the CCIP message ID
        return messageId;
    }

    /// @notice This function assumes that the approval for token transfers from custody wallet is properly managed off-chain.
    /// handle a received message
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
        nonReentrant
        onlyAllowlisted(
            any2EvmMessage.sourceChainSelector,
            abi.decode(any2EvmMessage.sender, (address))
        ) // Make sure source chain and sender are allowlisted
    {
        (address tokenReceiver, uint64 tokenId, uint256 amount) = abi.decode(any2EvmMessage.data, (address, uint64, uint256));

        address token = tokens[tokenId];
        
        IERC20(token).safeTransferFrom(
            _custodyWallet, tokenReceiver, amount
        );

        lastReceivedMessage.messageId = any2EvmMessage.messageId;
        lastReceivedMessage.receiver = tokenReceiver;
        lastReceivedMessage.token = token;
        lastReceivedMessage.amount = amount;

        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector, // fetch the source chain identifier (aka selector)
            abi.decode(any2EvmMessage.sender, (address)), // abi-decoding of the sender address,
            token,
            amount,
            tokenReceiver
        );
    }

    /// @notice Construct a CCIP message.
    /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for sending a text.
    /// @param _receiver The address of the message receiver. 
    /// @param _tokenReceiver The address of the token receiver. 
    /// @param _tokenId The arbitrary id of the token to be received on the destination blockchain.
    /// @param _amount The amount to be received.
    /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    function _buildCCIPMessage(
        address _receiver,
        address _tokenReceiver,
        uint64 _tokenId,
        uint256 _amount,
        uint256 _gasLimit
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: abi.encode(_tokenReceiver, _tokenId, _amount), // ABI-encoded message
                tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array aas no tokens are transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit
                    Client.EVMExtraArgsV1({gasLimit: _gasLimit})
                ),
                feeToken: address(0)
            });
    }

    /// @notice Fetches the details of the last received message.
    /// @return messageId The ID of the last received message.
    /// @return receiver The last received receiver.
    /// @return token The last received token.
    /// @return amount The last received amount.
    function getLastReceivedMessageDetails()
        external
        view
        returns (bytes32 messageId, address receiver, address token, uint256 amount)
    {
        return (lastReceivedMessage.messageId, lastReceivedMessage.receiver, lastReceivedMessage.token, lastReceivedMessage.amount);
    }

    /// @notice Fallback function to allow the contract to receive Ether.
    /// @dev This function has no function body, making it a default function for receiving Ether.
    /// It is automatically called when Ether is sent to the contract without any data.
    receive() external payable {}

    /// @notice Allows the contract owner to withdraw the entire balance of Ether from the contract.
    /// @dev This function reverts if there are no funds to withdraw or if the transfer fails.
    /// It should only be callable by the owner of the contract.
    /// @param _beneficiary The address to which the Ether should be sent.
    function withdraw(address _beneficiary) public onlyOwner {
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
    ) public onlyOwner {
        // Retrieve the balance of this contract
        uint256 amount = IERC20(_token).balanceOf(address(this));

        // Revert if there is nothing to withdraw
        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
    }
}