/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IBackedAutoFeeTokenImplementation,
  IBackedAutoFeeTokenImplementationInterface,
} from "../../../contracts/interfaces/IBackedAutoFeeTokenImplementation";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "delegatedTransferShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentMultiplier",
    outputs: [
      {
        internalType: "uint256",
        name: "newMultiplier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "periodsPassed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newMultiplierNonce",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_underlyingAmount",
        type: "uint256",
      },
    ],
    name: "getSharesByUnderlyingAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_sharesAmount",
        type: "uint256",
      },
    ],
    name: "getUnderlyingAmountByShares",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newLastTimeFeeApplied",
        type: "uint256",
      },
    ],
    name: "setLastTimeFeeApplied",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newMultiplierUpdater",
        type: "address",
      },
    ],
    name: "setMultiplierUpdater",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newPeriodLength",
        type: "uint256",
      },
    ],
    name: "setPeriodLength",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "sharesOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "sharesAmount",
        type: "uint256",
      },
    ],
    name: "transferShares",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newFeePerPeriod",
        type: "uint256",
      },
    ],
    name: "updateFeePerPeriod",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newMultiplier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "oldMultiplier",
        type: "uint256",
      },
    ],
    name: "updateMultiplierValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IBackedAutoFeeTokenImplementation__factory {
  static readonly abi = _abi;
  static createInterface(): IBackedAutoFeeTokenImplementationInterface {
    return new Interface(_abi) as IBackedAutoFeeTokenImplementationInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IBackedAutoFeeTokenImplementation {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IBackedAutoFeeTokenImplementation;
  }
}
