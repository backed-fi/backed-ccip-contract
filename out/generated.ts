import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen'

import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BackedCCIPReceiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const backedCcipReceiverAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [
      {
        name: 'destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
      },
    ],
    name: 'DestinationChainNotAllowlisted',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'FailedToWithdrawEth',
  },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'calculatedFees', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientMessageValue',
  },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'router', internalType: 'address', type: 'address' }],
    name: 'InvalidRouter',
  },
  { type: 'error', inputs: [], name: 'InvalidTokenAddress' },
  { type: 'error', inputs: [], name: 'InvalidTokenId' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NothingToWithdraw' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'SenderNotAllowlisted',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sourceChainSelector', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'SourceChainNotAllowlisted',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'TokenNotRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newCustodywallet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CustodyWalletUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'destinationChainReceiver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DestinationChainRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'DestinationChainRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newGasLimit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GasLimitUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'messageId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'reason',
        internalType: 'enum BackedCCIPReceiver.InvalidMessageReason',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'InvalidMessageReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'messageId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sourceChainSelector',
        internalType: 'uint64',
        type: 'uint64',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenReceiver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'MessageReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'messageId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenReceiver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenId',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'fees',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MessageSent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sourceChainSelector',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'sourceChainSender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SourceChainRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sourceChainSelector',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'SourceChainRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenId',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'TokenRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenId',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'TokenRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    name: 'allowlistedDestinationChains',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    name: 'allowlistedSourceChains',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'message',
        internalType: 'struct Client.Any2EVMMessage',
        type: 'tuple',
        components: [
          { name: 'messageId', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'sourceChainSelector',
            internalType: 'uint64',
            type: 'uint64',
          },
          { name: 'sender', internalType: 'bytes', type: 'bytes' },
          { name: 'data', internalType: 'bytes', type: 'bytes' },
          {
            name: 'destTokenAmounts',
            internalType: 'struct Client.EVMTokenAmount[]',
            type: 'tuple[]',
            components: [
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'ccipReceive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'custodyWallet',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasLimit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
      },
      { name: '_tokenReceiver', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getDeliveryFeeCost',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRouter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_router', internalType: 'address', type: 'address' },
      { name: '_custody', internalType: 'address', type: 'address' },
      { name: '_gasLimit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
      },
      {
        name: '_destinationChainReceiver',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'registerDestinationChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_sourceChainSelector', internalType: 'uint64', type: 'uint64' },
      { name: '_sourceChainSender', internalType: 'address', type: 'address' },
    ],
    name: 'registerSourceChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'registerToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
      },
    ],
    name: 'removeDestinationChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_sourceChainSelector', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'removeSourceChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_token', internalType: 'address', type: 'address' }],
    name: 'removeToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_destinationChainSelector',
        internalType: 'uint64',
        type: 'uint64',
      },
      { name: '_tokenReceiver', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'send',
    outputs: [{ name: 'messageId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'tokenIds',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    name: 'tokens',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_custody', internalType: 'address', type: 'address' }],
    name: 'updateCustodyWallet',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_gasLimit', internalType: 'uint256', type: 'uint256' }],
    name: 'updateGasLimit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_beneficiary', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_beneficiary', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const readBackedCcipReceiver = /*#__PURE__*/ createReadContract({
  abi: backedCcipReceiverAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"allowlistedDestinationChains"`
 */
export const readBackedCcipReceiverAllowlistedDestinationChains =
  /*#__PURE__*/ createReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'allowlistedDestinationChains',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"allowlistedSourceChains"`
 */
export const readBackedCcipReceiverAllowlistedSourceChains =
  /*#__PURE__*/ createReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'allowlistedSourceChains',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"custodyWallet"`
 */
export const readBackedCcipReceiverCustodyWallet =
  /*#__PURE__*/ createReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'custodyWallet',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"gasLimit"`
 */
export const readBackedCcipReceiverGasLimit = /*#__PURE__*/ createReadContract({
  abi: backedCcipReceiverAbi,
  functionName: 'gasLimit',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"getDeliveryFeeCost"`
 */
export const readBackedCcipReceiverGetDeliveryFeeCost =
  /*#__PURE__*/ createReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'getDeliveryFeeCost',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"getRouter"`
 */
export const readBackedCcipReceiverGetRouter = /*#__PURE__*/ createReadContract(
  { abi: backedCcipReceiverAbi, functionName: 'getRouter' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"owner"`
 */
export const readBackedCcipReceiverOwner = /*#__PURE__*/ createReadContract({
  abi: backedCcipReceiverAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"paused"`
 */
export const readBackedCcipReceiverPaused = /*#__PURE__*/ createReadContract({
  abi: backedCcipReceiverAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readBackedCcipReceiverSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"tokenIds"`
 */
export const readBackedCcipReceiverTokenIds = /*#__PURE__*/ createReadContract({
  abi: backedCcipReceiverAbi,
  functionName: 'tokenIds',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"tokens"`
 */
export const readBackedCcipReceiverTokens = /*#__PURE__*/ createReadContract({
  abi: backedCcipReceiverAbi,
  functionName: 'tokens',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const writeBackedCcipReceiver = /*#__PURE__*/ createWriteContract({
  abi: backedCcipReceiverAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"ccipReceive"`
 */
export const writeBackedCcipReceiverCcipReceive =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'ccipReceive',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"initialize"`
 */
export const writeBackedCcipReceiverInitialize =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"pause"`
 */
export const writeBackedCcipReceiverPause = /*#__PURE__*/ createWriteContract({
  abi: backedCcipReceiverAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerDestinationChain"`
 */
export const writeBackedCcipReceiverRegisterDestinationChain =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerDestinationChain',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerSourceChain"`
 */
export const writeBackedCcipReceiverRegisterSourceChain =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerSourceChain',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerToken"`
 */
export const writeBackedCcipReceiverRegisterToken =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeDestinationChain"`
 */
export const writeBackedCcipReceiverRemoveDestinationChain =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeDestinationChain',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeSourceChain"`
 */
export const writeBackedCcipReceiverRemoveSourceChain =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeSourceChain',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeToken"`
 */
export const writeBackedCcipReceiverRemoveToken =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const writeBackedCcipReceiverRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"send"`
 */
export const writeBackedCcipReceiverSend = /*#__PURE__*/ createWriteContract({
  abi: backedCcipReceiverAbi,
  functionName: 'send',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeBackedCcipReceiverTransferOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"unpause"`
 */
export const writeBackedCcipReceiverUnpause = /*#__PURE__*/ createWriteContract(
  { abi: backedCcipReceiverAbi, functionName: 'unpause' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateCustodyWallet"`
 */
export const writeBackedCcipReceiverUpdateCustodyWallet =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateCustodyWallet',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateGasLimit"`
 */
export const writeBackedCcipReceiverUpdateGasLimit =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateGasLimit',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdraw"`
 */
export const writeBackedCcipReceiverWithdraw =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdrawToken"`
 */
export const writeBackedCcipReceiverWithdrawToken =
  /*#__PURE__*/ createWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdrawToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const simulateBackedCcipReceiver = /*#__PURE__*/ createSimulateContract({
  abi: backedCcipReceiverAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"ccipReceive"`
 */
export const simulateBackedCcipReceiverCcipReceive =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'ccipReceive',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateBackedCcipReceiverInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"pause"`
 */
export const simulateBackedCcipReceiverPause =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerDestinationChain"`
 */
export const simulateBackedCcipReceiverRegisterDestinationChain =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerDestinationChain',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerSourceChain"`
 */
export const simulateBackedCcipReceiverRegisterSourceChain =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerSourceChain',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerToken"`
 */
export const simulateBackedCcipReceiverRegisterToken =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeDestinationChain"`
 */
export const simulateBackedCcipReceiverRemoveDestinationChain =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeDestinationChain',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeSourceChain"`
 */
export const simulateBackedCcipReceiverRemoveSourceChain =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeSourceChain',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeToken"`
 */
export const simulateBackedCcipReceiverRemoveToken =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const simulateBackedCcipReceiverRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"send"`
 */
export const simulateBackedCcipReceiverSend =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'send',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateBackedCcipReceiverTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"unpause"`
 */
export const simulateBackedCcipReceiverUnpause =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateCustodyWallet"`
 */
export const simulateBackedCcipReceiverUpdateCustodyWallet =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateCustodyWallet',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateGasLimit"`
 */
export const simulateBackedCcipReceiverUpdateGasLimit =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateGasLimit',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdraw"`
 */
export const simulateBackedCcipReceiverWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdrawToken"`
 */
export const simulateBackedCcipReceiverWithdrawToken =
  /*#__PURE__*/ createSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdrawToken',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const watchBackedCcipReceiverEvent =
  /*#__PURE__*/ createWatchContractEvent({ abi: backedCcipReceiverAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"CustodyWalletUpdated"`
 */
export const watchBackedCcipReceiverCustodyWalletUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'CustodyWalletUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"DestinationChainRegistered"`
 */
export const watchBackedCcipReceiverDestinationChainRegisteredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'DestinationChainRegistered',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"DestinationChainRemoved"`
 */
export const watchBackedCcipReceiverDestinationChainRemovedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'DestinationChainRemoved',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"GasLimitUpdated"`
 */
export const watchBackedCcipReceiverGasLimitUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'GasLimitUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchBackedCcipReceiverInitializedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"InvalidMessageReceived"`
 */
export const watchBackedCcipReceiverInvalidMessageReceivedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'InvalidMessageReceived',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"MessageReceived"`
 */
export const watchBackedCcipReceiverMessageReceivedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'MessageReceived',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"MessageSent"`
 */
export const watchBackedCcipReceiverMessageSentEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'MessageSent',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const watchBackedCcipReceiverOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"Paused"`
 */
export const watchBackedCcipReceiverPausedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"SourceChainRegistered"`
 */
export const watchBackedCcipReceiverSourceChainRegisteredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'SourceChainRegistered',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"SourceChainRemoved"`
 */
export const watchBackedCcipReceiverSourceChainRemovedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'SourceChainRemoved',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"TokenRegistered"`
 */
export const watchBackedCcipReceiverTokenRegisteredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'TokenRegistered',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"TokenRemoved"`
 */
export const watchBackedCcipReceiverTokenRemovedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'TokenRemoved',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"Unpaused"`
 */
export const watchBackedCcipReceiverUnpausedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const readErc20 = /*#__PURE__*/ createReadContract({ abi: erc20Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const readErc20Allowance = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const readErc20BalanceOf = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const readErc20Decimals = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const readErc20Name = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const readErc20Symbol = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const readErc20TotalSupply = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const writeErc20 = /*#__PURE__*/ createWriteContract({ abi: erc20Abi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const writeErc20Approve = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const writeErc20Transfer = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const writeErc20TransferFrom = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const simulateErc20 = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const simulateErc20Approve = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const simulateErc20Transfer = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const simulateErc20TransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const watchErc20Event = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const watchErc20ApprovalEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Approval',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const watchErc20TransferEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Transfer',
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const useReadBackedCcipReceiver = /*#__PURE__*/ createUseReadContract({
  abi: backedCcipReceiverAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"allowlistedDestinationChains"`
 */
export const useReadBackedCcipReceiverAllowlistedDestinationChains =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'allowlistedDestinationChains',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"allowlistedSourceChains"`
 */
export const useReadBackedCcipReceiverAllowlistedSourceChains =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'allowlistedSourceChains',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"custodyWallet"`
 */
export const useReadBackedCcipReceiverCustodyWallet =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'custodyWallet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"gasLimit"`
 */
export const useReadBackedCcipReceiverGasLimit =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'gasLimit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"getDeliveryFeeCost"`
 */
export const useReadBackedCcipReceiverGetDeliveryFeeCost =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'getDeliveryFeeCost',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"getRouter"`
 */
export const useReadBackedCcipReceiverGetRouter =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'getRouter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"owner"`
 */
export const useReadBackedCcipReceiverOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"paused"`
 */
export const useReadBackedCcipReceiverPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadBackedCcipReceiverSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"tokenIds"`
 */
export const useReadBackedCcipReceiverTokenIds =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'tokenIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"tokens"`
 */
export const useReadBackedCcipReceiverTokens =
  /*#__PURE__*/ createUseReadContract({
    abi: backedCcipReceiverAbi,
    functionName: 'tokens',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const useWriteBackedCcipReceiver = /*#__PURE__*/ createUseWriteContract({
  abi: backedCcipReceiverAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"ccipReceive"`
 */
export const useWriteBackedCcipReceiverCcipReceive =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'ccipReceive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteBackedCcipReceiverInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteBackedCcipReceiverPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerDestinationChain"`
 */
export const useWriteBackedCcipReceiverRegisterDestinationChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerDestinationChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerSourceChain"`
 */
export const useWriteBackedCcipReceiverRegisterSourceChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerSourceChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerToken"`
 */
export const useWriteBackedCcipReceiverRegisterToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeDestinationChain"`
 */
export const useWriteBackedCcipReceiverRemoveDestinationChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeDestinationChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeSourceChain"`
 */
export const useWriteBackedCcipReceiverRemoveSourceChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeSourceChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeToken"`
 */
export const useWriteBackedCcipReceiverRemoveToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBackedCcipReceiverRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"send"`
 */
export const useWriteBackedCcipReceiverSend =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'send',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBackedCcipReceiverTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteBackedCcipReceiverUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateCustodyWallet"`
 */
export const useWriteBackedCcipReceiverUpdateCustodyWallet =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateCustodyWallet',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateGasLimit"`
 */
export const useWriteBackedCcipReceiverUpdateGasLimit =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateGasLimit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteBackedCcipReceiverWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdrawToken"`
 */
export const useWriteBackedCcipReceiverWithdrawToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdrawToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const useSimulateBackedCcipReceiver =
  /*#__PURE__*/ createUseSimulateContract({ abi: backedCcipReceiverAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"ccipReceive"`
 */
export const useSimulateBackedCcipReceiverCcipReceive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'ccipReceive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateBackedCcipReceiverInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateBackedCcipReceiverPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerDestinationChain"`
 */
export const useSimulateBackedCcipReceiverRegisterDestinationChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerDestinationChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerSourceChain"`
 */
export const useSimulateBackedCcipReceiverRegisterSourceChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerSourceChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"registerToken"`
 */
export const useSimulateBackedCcipReceiverRegisterToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'registerToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeDestinationChain"`
 */
export const useSimulateBackedCcipReceiverRemoveDestinationChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeDestinationChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeSourceChain"`
 */
export const useSimulateBackedCcipReceiverRemoveSourceChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeSourceChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"removeToken"`
 */
export const useSimulateBackedCcipReceiverRemoveToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'removeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBackedCcipReceiverRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"send"`
 */
export const useSimulateBackedCcipReceiverSend =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'send',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBackedCcipReceiverTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateBackedCcipReceiverUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateCustodyWallet"`
 */
export const useSimulateBackedCcipReceiverUpdateCustodyWallet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateCustodyWallet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"updateGasLimit"`
 */
export const useSimulateBackedCcipReceiverUpdateGasLimit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'updateGasLimit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateBackedCcipReceiverWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `functionName` set to `"withdrawToken"`
 */
export const useSimulateBackedCcipReceiverWithdrawToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: backedCcipReceiverAbi,
    functionName: 'withdrawToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__
 */
export const useWatchBackedCcipReceiverEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: backedCcipReceiverAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"CustodyWalletUpdated"`
 */
export const useWatchBackedCcipReceiverCustodyWalletUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'CustodyWalletUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"DestinationChainRegistered"`
 */
export const useWatchBackedCcipReceiverDestinationChainRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'DestinationChainRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"DestinationChainRemoved"`
 */
export const useWatchBackedCcipReceiverDestinationChainRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'DestinationChainRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"GasLimitUpdated"`
 */
export const useWatchBackedCcipReceiverGasLimitUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'GasLimitUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchBackedCcipReceiverInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"InvalidMessageReceived"`
 */
export const useWatchBackedCcipReceiverInvalidMessageReceivedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'InvalidMessageReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"MessageReceived"`
 */
export const useWatchBackedCcipReceiverMessageReceivedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'MessageReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"MessageSent"`
 */
export const useWatchBackedCcipReceiverMessageSentEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'MessageSent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBackedCcipReceiverOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchBackedCcipReceiverPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"SourceChainRegistered"`
 */
export const useWatchBackedCcipReceiverSourceChainRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'SourceChainRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"SourceChainRemoved"`
 */
export const useWatchBackedCcipReceiverSourceChainRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'SourceChainRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"TokenRegistered"`
 */
export const useWatchBackedCcipReceiverTokenRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'TokenRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"TokenRemoved"`
 */
export const useWatchBackedCcipReceiverTokenRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'TokenRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link backedCcipReceiverAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchBackedCcipReceiverUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: backedCcipReceiverAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Transfer',
  })
