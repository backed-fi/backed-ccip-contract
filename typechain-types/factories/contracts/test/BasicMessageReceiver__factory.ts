/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  BasicMessageReceiver,
  BasicMessageReceiverInterface,
} from "../../../contracts/test/BasicMessageReceiver";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    name: "InvalidRouter",
    type: "error",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "messageId",
            type: "bytes32",
          },
          {
            internalType: "uint64",
            name: "sourceChainSelector",
            type: "uint64",
          },
          {
            internalType: "bytes",
            name: "sender",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct Client.EVMTokenAmount[]",
            name: "destTokenAmounts",
            type: "tuple[]",
          },
        ],
        internalType: "struct Client.Any2EVMMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "ccipReceive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getLatestMessageDetails",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
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
    name: "getRouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b5060405162000c6138038062000c6183398181016040528101906100349190610145565b80600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036100a75760006040517fd7f7333400000000000000000000000000000000000000000000000000000000815260040161009e9190610181565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1681525050505061019c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610112826100e7565b9050919050565b61012281610107565b811461012d57600080fd5b50565b60008151905061013f81610119565b92915050565b60006020828403121561015b5761015a6100e2565b5b600061016984828501610130565b91505092915050565b61017b81610107565b82525050565b60006020820190506101966000830184610172565b92915050565b608051610aa2620001bf6000396000818161020401526102ab0152610aa26000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806301ffc9a7146100515780633394e6f41461008157806385572ffb146100a2578063b0f479a1146100be575b600080fd5b61006b600480360381019061006691906103e0565b6100dc565b6040516100789190610428565b60405180910390f35b6100896101ae565b60405161009994939291906104d9565b60405180910390f35b6100bc60048036038101906100b79190610542565b610202565b005b6100c66102a7565b6040516100d3919061058b565b60405180910390f35b60007f85572ffb000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806101a757507f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b600080600080600054600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160149054906101000a900467ffffffffffffffff16600254935093509350935090919293565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461029257336040517fd7f73334000000000000000000000000000000000000000000000000000000008152600401610289919061058b565b60405180910390fd5b6102a48161029f9061099e565b6102cf565b50565b60007f0000000000000000000000000000000000000000000000000000000000000000905090565b8060000151600081905550600080600083606001518060200190518101906102f79190610a19565b92509250925082600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055508060028190555050505050565b6000604051905090565b600080fd5b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6103bd81610388565b81146103c857600080fd5b50565b6000813590506103da816103b4565b92915050565b6000602082840312156103f6576103f561037e565b5b6000610404848285016103cb565b91505092915050565b60008115159050919050565b6104228161040d565b82525050565b600060208201905061043d6000830184610419565b92915050565b6000819050919050565b61045681610443565b82525050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104878261045c565b9050919050565b6104978161047c565b82525050565b600067ffffffffffffffff82169050919050565b6104ba8161049d565b82525050565b6000819050919050565b6104d3816104c0565b82525050565b60006080820190506104ee600083018761044d565b6104fb602083018661048e565b61050860408301856104b1565b61051560608301846104ca565b95945050505050565b600080fd5b600060a082840312156105395761053861051e565b5b81905092915050565b6000602082840312156105585761055761037e565b5b600082013567ffffffffffffffff81111561057657610575610383565b5b61058284828501610523565b91505092915050565b60006020820190506105a0600083018461048e565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6105f4826105ab565b810181811067ffffffffffffffff82111715610613576106126105bc565b5b80604052505050565b6000610626610374565b905061063282826105eb565b919050565b600080fd5b61064581610443565b811461065057600080fd5b50565b6000813590506106628161063c565b92915050565b6106718161049d565b811461067c57600080fd5b50565b60008135905061068e81610668565b92915050565b600080fd5b600080fd5b600067ffffffffffffffff8211156106b9576106b86105bc565b5b6106c2826105ab565b9050602081019050919050565b82818337600083830152505050565b60006106f16106ec8461069e565b61061c565b90508281526020810184848401111561070d5761070c610699565b5b6107188482856106cf565b509392505050565b600082601f83011261073557610734610694565b5b81356107458482602086016106de565b91505092915050565b600067ffffffffffffffff821115610769576107686105bc565b5b602082029050602081019050919050565b600080fd5b6107888161047c565b811461079357600080fd5b50565b6000813590506107a58161077f565b92915050565b6107b4816104c0565b81146107bf57600080fd5b50565b6000813590506107d1816107ab565b92915050565b6000604082840312156107ed576107ec6105a6565b5b6107f7604061061c565b9050600061080784828501610796565b600083015250602061081b848285016107c2565b60208301525092915050565b600061083a6108358461074e565b61061c565b9050808382526020820190506040840283018581111561085d5761085c61077a565b5b835b81811015610886578061087288826107d7565b84526020840193505060408101905061085f565b5050509392505050565b600082601f8301126108a5576108a4610694565b5b81356108b5848260208601610827565b91505092915050565b600060a082840312156108d4576108d36105a6565b5b6108de60a061061c565b905060006108ee84828501610653565b60008301525060206109028482850161067f565b602083015250604082013567ffffffffffffffff81111561092657610925610637565b5b61093284828501610720565b604083015250606082013567ffffffffffffffff81111561095657610955610637565b5b61096284828501610720565b606083015250608082013567ffffffffffffffff81111561098657610985610637565b5b61099284828501610890565b60808301525092915050565b60006109aa36836108be565b9050919050565b60006109bc8261045c565b9050919050565b6109cc816109b1565b81146109d757600080fd5b50565b6000815190506109e9816109c3565b92915050565b6000815190506109fe81610668565b92915050565b600081519050610a13816107ab565b92915050565b600080600060608486031215610a3257610a3161037e565b5b6000610a40868287016109da565b9350506020610a51868287016109ef565b9250506040610a6286828701610a04565b915050925092509256fea2646970667358221220eb815155792b1efcaf301e5e63d1ad744f0ee00dd925dc74eca725fd1dfa8a3e64736f6c63430008170033";

type BasicMessageReceiverConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BasicMessageReceiverConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BasicMessageReceiver__factory extends ContractFactory {
  constructor(...args: BasicMessageReceiverConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    router: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(router, overrides || {});
  }
  override deploy(
    router: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(router, overrides || {}) as Promise<
      BasicMessageReceiver & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): BasicMessageReceiver__factory {
    return super.connect(runner) as BasicMessageReceiver__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BasicMessageReceiverInterface {
    return new Interface(_abi) as BasicMessageReceiverInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): BasicMessageReceiver {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as BasicMessageReceiver;
  }
}
