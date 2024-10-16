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
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface IBackedAutoFeeTokenImplementationInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "balanceOf"
      | "delegatedTransferShares"
      | "getCurrentMultiplier"
      | "getSharesByUnderlyingAmount"
      | "getUnderlyingAmountByShares"
      | "setLastTimeFeeApplied"
      | "setMultiplierUpdater"
      | "setPeriodLength"
      | "sharesOf"
      | "totalSupply"
      | "transferShares"
      | "updateFeePerPeriod"
      | "updateMultiplierValue"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "delegatedTransferShares",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
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
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferShares",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateFeePerPeriod",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateMultiplierValue",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "delegatedTransferShares",
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
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateFeePerPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateMultiplierValue",
    data: BytesLike
  ): Result;
}

export interface IBackedAutoFeeTokenImplementation extends BaseContract {
  connect(runner?: ContractRunner | null): IBackedAutoFeeTokenImplementation;
  waitForDeployment(): Promise<this>;

  interface: IBackedAutoFeeTokenImplementationInterface;

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

  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  delegatedTransferShares: TypedContractMethod<
    [
      owner: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  getCurrentMultiplier: TypedContractMethod<
    [],
    [
      [bigint, bigint, bigint] & {
        newMultiplier: bigint;
        periodsPassed: bigint;
        newMultiplierNonce: bigint;
      }
    ],
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

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  transferShares: TypedContractMethod<
    [to: AddressLike, sharesAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  updateFeePerPeriod: TypedContractMethod<
    [newFeePerPeriod: BigNumberish],
    [void],
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
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "delegatedTransferShares"
  ): TypedContractMethod<
    [
      owner: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getCurrentMultiplier"
  ): TypedContractMethod<
    [],
    [
      [bigint, bigint, bigint] & {
        newMultiplier: bigint;
        periodsPassed: bigint;
        newMultiplierNonce: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getSharesByUnderlyingAmount"
  ): TypedContractMethod<[_underlyingAmount: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getUnderlyingAmountByShares"
  ): TypedContractMethod<[_sharesAmount: BigNumberish], [bigint], "view">;
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
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transferShares"
  ): TypedContractMethod<
    [to: AddressLike, sharesAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "updateFeePerPeriod"
  ): TypedContractMethod<[newFeePerPeriod: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "updateMultiplierValue"
  ): TypedContractMethod<
    [newMultiplier: BigNumberish, oldMultiplier: BigNumberish],
    [void],
    "nonpayable"
  >;

  filters: {};
}
