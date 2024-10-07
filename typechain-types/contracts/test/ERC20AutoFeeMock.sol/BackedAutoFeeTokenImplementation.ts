/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface BackedAutoFeeTokenImplementationInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "allowance"
      | "approve"
      | "balanceOf"
      | "burn"
      | "decimals"
      | "feePerPeriod"
      | "getCurrentMultiplier"
      | "getSharesByUnderlyingAmount"
      | "getUnderlyingAmountByShares"
      | "lastTimeFeeApplied"
      | "mint"
      | "multiplier"
      | "multiplierUpdater"
      | "name"
      | "periodLength"
      | "setLastTimeFeeApplied"
      | "setMultiplierUpdater"
      | "setPeriodLength"
      | "sharesOf"
      | "symbol"
      | "totalSupply"
      | "transfer(address,uint256)"
      | "transfer(address,address,uint256)"
      | "transferFrom"
      | "transferShares"
      | "updateMultiplierValue"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "Approval" | "Transfer"): EventFragment;

  encodeFunctionData(
    functionFragment: "allowance",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "burn",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "feePerPeriod",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentMultiplier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getSharesByUnderlyingAmount",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getUnderlyingAmountByShares",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "lastTimeFeeApplied",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "multiplier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "multiplierUpdater",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "periodLength",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setLastTimeFeeApplied",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMultiplierUpdater",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setPeriodLength",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "sharesOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer(address,uint256)",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transfer(address,address,uint256)",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferShares",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateMultiplierValue",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "feePerPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentMultiplier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSharesByUnderlyingAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUnderlyingAmountByShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastTimeFeeApplied",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "multiplier", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "multiplierUpdater",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "periodLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLastTimeFeeApplied",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMultiplierUpdater",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPeriodLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sharesOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transfer(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transfer(address,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateMultiplierValue",
    data: BytesLike
  ): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [
    owner: AddressLike,
    spender: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [owner: string, spender: string, value: bigint];
  export interface OutputObject {
    owner: string;
    spender: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, value: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface BackedAutoFeeTokenImplementation extends BaseContract {
  connect(runner?: ContractRunner | null): BackedAutoFeeTokenImplementation;
  waitForDeployment(): Promise<this>;

  interface: BackedAutoFeeTokenImplementationInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  allowance: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;

  approve: TypedContractMethod<
    [spender: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  burn: TypedContractMethod<
    [account: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  decimals: TypedContractMethod<[], [bigint], "view">;

  feePerPeriod: TypedContractMethod<[], [bigint], "view">;

  getCurrentMultiplier: TypedContractMethod<
    [],
    [[bigint, bigint] & { newMultiplier: bigint; periodsPassed: bigint }],
    "view"
  >;

  getSharesByUnderlyingAmount: TypedContractMethod<
    [_underlyingAmount: BigNumberish],
    [bigint],
    "view"
  >;

  getUnderlyingAmountByShares: TypedContractMethod<
    [_sharesAmount: BigNumberish],
    [bigint],
    "view"
  >;

  lastTimeFeeApplied: TypedContractMethod<[], [bigint], "view">;

  mint: TypedContractMethod<
    [account: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  multiplier: TypedContractMethod<[], [bigint], "view">;

  multiplierUpdater: TypedContractMethod<[], [string], "view">;

  name: TypedContractMethod<[], [string], "view">;

  periodLength: TypedContractMethod<[], [bigint], "view">;

  setLastTimeFeeApplied: TypedContractMethod<
    [newLastTimeFeeApplied: BigNumberish],
    [void],
    "nonpayable"
  >;

  setMultiplierUpdater: TypedContractMethod<
    [newMultiplierUpdater: AddressLike],
    [void],
    "nonpayable"
  >;

  setPeriodLength: TypedContractMethod<
    [newPeriodLength: BigNumberish],
    [void],
    "nonpayable"
  >;

  sharesOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  symbol: TypedContractMethod<[], [string], "view">;

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  "transfer(address,uint256)": TypedContractMethod<
    [to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  "transfer(address,address,uint256)": TypedContractMethod<
    [from: AddressLike, to: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  transferFrom: TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  transferShares: TypedContractMethod<
    [to: AddressLike, sharesAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  updateMultiplierValue: TypedContractMethod<
    [newMultiplier: BigNumberish, oldMultiplier: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "allowance"
  ): TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "approve"
  ): TypedContractMethod<
    [spender: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "burn"
  ): TypedContractMethod<
    [account: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "feePerPeriod"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getCurrentMultiplier"
  ): TypedContractMethod<
    [],
    [[bigint, bigint] & { newMultiplier: bigint; periodsPassed: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getSharesByUnderlyingAmount"
  ): TypedContractMethod<[_underlyingAmount: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getUnderlyingAmountByShares"
  ): TypedContractMethod<[_sharesAmount: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "lastTimeFeeApplied"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "mint"
  ): TypedContractMethod<
    [account: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "multiplier"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "multiplierUpdater"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "periodLength"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "setLastTimeFeeApplied"
  ): TypedContractMethod<
    [newLastTimeFeeApplied: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setMultiplierUpdater"
  ): TypedContractMethod<
    [newMultiplierUpdater: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPeriodLength"
  ): TypedContractMethod<[newPeriodLength: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "sharesOf"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transfer(address,uint256)"
  ): TypedContractMethod<
    [to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transfer(address,address,uint256)"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferShares"
  ): TypedContractMethod<
    [to: AddressLike, sharesAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "updateMultiplierValue"
  ): TypedContractMethod<
    [newMultiplier: BigNumberish, oldMultiplier: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "Approval"
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;

  filters: {
    "Approval(address,address,uint256)": TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    "Transfer(address,address,uint256)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
  };
}
