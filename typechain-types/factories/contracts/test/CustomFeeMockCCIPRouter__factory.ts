/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  CustomFeeMockCCIPRouter,
  CustomFeeMockCCIPRouterInterface,
} from "../../../contracts/test/CustomFeeMockCCIPRouter";

const _abi = [
  {
    inputs: [],
    name: "InsufficientFeeTokenAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "encodedAddress",
        type: "bytes",
      },
    ],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidExtraArgsTag",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMsgValue",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyOffRamp",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "error",
        type: "bytes",
      },
    ],
    name: "ReceiverError",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destChainSelector",
        type: "uint64",
      },
    ],
    name: "UnsupportedDestinationChain",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "sourceChainSelector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "offRamp",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "calldataHash",
        type: "bytes32",
      },
    ],
    name: "MessageExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "retData",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasUsed",
        type: "uint256",
      },
    ],
    name: "MsgExecuted",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_GAS_LIMIT",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAS_FOR_CALL_EXACT_CHECK",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "receiver",
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
            name: "tokenAmounts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "feeToken",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "extraArgs",
            type: "bytes",
          },
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "ccipSend",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "receiver",
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
            name: "tokenAmounts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "feeToken",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "extraArgs",
            type: "bytes",
          },
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "",
        type: "tuple",
      },
    ],
    name: "getFee",
    outputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "getOnRamp",
    outputs: [
      {
        internalType: "address",
        name: "onRampAddress",
        type: "address",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "getSupportedTokens",
    outputs: [
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "isChainSupported",
    outputs: [
      {
        internalType: "bool",
        name: "supported",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isOffRamp",
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
      {
        internalType: "uint16",
        name: "gasForCallExactCheck",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "routeMessage",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "retData",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "gasUsed",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506124fd806100206000396000f3fe60806040526004361061008a5760003560e01c8063a48a905811610059578063a48a90581461017f578063a8d87a3b146101bc578063d6be695a146101f9578063ee18e0d314610224578063fbca3b741461024f57610091565b806320487ded146100965780633cf97983146100d357806383826b2b1461011257806396f4e9f91461014f57610091565b3661009157005b600080fd5b3480156100a257600080fd5b506100bd60048036038101906100b8919061134e565b61028c565b6040516100ca91906113b9565b60405180910390f35b3480156100df57600080fd5b506100fa60048036038101906100f59190611432565b610298565b6040516101099392919061154f565b60405180910390f35b34801561011e57600080fd5b506101396004803603810190610134919061158d565b6102c3565b60405161014691906115cd565b60405180910390f35b61016960048036038101906101649190611607565b6102cf565b604051610176919061167c565b60405180910390f35b34801561018b57600080fd5b506101a660048036038101906101a19190611697565b61064f565b6040516101b391906115cd565b60405180910390f35b3480156101c857600080fd5b506101e360048036038101906101de9190611697565b61065a565b6040516101f091906116d3565b60405180910390f35b34801561020557600080fd5b5061020e610668565b60405161021b91906116fd565b60405180910390f35b34801561023057600080fd5b5061023961066f565b6040516102469190611727565b60405180910390f35b34801561025b57600080fd5b5061027660048036038101906102719190611697565b610675565b6040516102839190611800565b60405180910390f35b60006001905092915050565b6000606060006102b3876102ab9061192e565b8787876106c8565b9250925092509450945094915050565b60006001905092915050565b600060208280600001906102e39190611950565b905014610337578180600001906102fa9190611950565b6040517f370d875f00000000000000000000000000000000000000000000000000000000815260040161032e9291906119e0565b60405180910390fd5b60008280600001906103499190611950565b8101906103569190611a04565b905073ffffffffffffffffffffffffffffffffffffffff801681118061037c5750600a81105b156103ce578280600001906103919190611950565b6040517f370d875f0000000000000000000000000000000000000000000000000000000081526004016103c59291906119e0565b60405180910390fd5b600081905060006103ed8580608001906103e89190611950565b610885565b6000015190506000856040516020016104069190611d23565b60405160208183030381529060405280519060200120905060006040518060a0016040528083815260200167de41ba4fc9d91ad967ffffffffffffffff1681526020013360405160200161045a91906116d3565b604051602081830303815290604052815260200188806020019061047e9190611950565b8080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505081526020018880604001906104d69190611d45565b808060200260200160405190810160405280939291908181526020016000905b82821015610526578484839050604002018036038101906105179190611da8565b815260200190600101906104f6565b5050505050815250905060005b8780604001906105439190611d45565b90508110156105e6576105db33868a80604001906105619190611d45565b8581811061057257610571611dd5565b5b905060400201602001358b806040019061058c9190611d45565b8681811061059d5761059c611dd5565b5b90506040020160000160208101906105b59190611e04565b73ffffffffffffffffffffffffffffffffffffffff1661096e909392919063ffffffff16565b806001019050610533565b506000806105f88361138887896106c8565b50915091508161063f57806040517f0a8d6e8c0000000000000000000000000000000000000000000000000000000081526004016106369190611e31565b60405180910390fd5b8397505050505050505092915050565b600060019050919050565b600063499602d29050919050565b62030d4081565b61138881565b6060600067ffffffffffffffff81111561069257610691610f6c565b5b6040519080825280602002602001820160405280156106c05781602001602082028036833780820191505090505b509050919050565b600060606000808473ffffffffffffffffffffffffffffffffffffffff163b148061073957506107377f85572ffb000000000000000000000000000000000000000000000000000000008573ffffffffffffffffffffffffffffffffffffffff166109f790919063ffffffff16565b155b1561075e5760016000604051806020016040528060008152509092509250925061087b565b60006385572ffb60e01b886040516024016107799190611ffb565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090506107e68186888a6084610a1c565b8094508195508296505050507fa8b0355886b5b7a28bb97e4f0a24feb172618407402721c4012d8b7c6433102f8484846040516108259392919061154f565b60405180910390a17f9b877de93ea9895756e337442c657f95a34fc68e7eb988bdfa693d5be83016b688600001518960200151338480519060200120604051610871949392919061201d565b60405180910390a1505b9450945094915050565b61088d610eef565b600083839050036108bb57604051806020016040528062030d4067ffffffffffffffff168152509050610968565b6397a657c960e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168383906108ef91906120a6565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614610945576040517f5247fdce00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b828260049080926109589392919061210f565b8101906109659190612186565b90505b92915050565b6109f1846323b872dd60e01b85858560405160240161098f939291906121b3565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610b4f565b50505050565b6000610a0283610c16565b8015610a145750610a138383610c63565b5b905092915050565b6000606060008361ffff1667ffffffffffffffff811115610a4057610a3f610f6c565b5b6040519080825280601f01601f191660200182016040528015610a725781602001600182028036833780820191505090505b509150863b610aa5577f0c3b563c0000000000000000000000000000000000000000000000000000000060005260046000fd5b5a85811015610ad8577fafa32a2c0000000000000000000000000000000000000000000000000000000060005260046000fd5b85810390508660408204820311610b13577f37c3be290000000000000000000000000000000000000000000000000000000060005260046000fd5b5a6000808b5160208d0160008d8df194505a810392503d86811115610b36578690505b808552806000602087013e505050955095509592505050565b6000610bb1826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16610d229092919063ffffffff16565b9050600081511115610c115780806020019051810190610bd19190612216565b610c10576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c07906122c6565b60405180910390fd5b5b505050565b6000610c42827f01ffc9a700000000000000000000000000000000000000000000000000000000610c63565b8015610c5c5750610c5a8263ffffffff60e01b610c63565b155b9050919050565b6000806301ffc9a760e01b83604051602401610c7f91906122f5565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090506000806000602060008551602087018a617530fa92503d91506000519050828015610d0a575060208210155b8015610d165750600081115b94505050505092915050565b6060610d318484600085610d3a565b90509392505050565b606082471015610d7f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7690612382565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051610da891906123de565b60006040518083038185875af1925050503d8060008114610de5576040519150601f19603f3d011682016040523d82523d6000602084013e610dea565b606091505b5091509150610dfb87838387610e07565b92505050949350505050565b60608315610e69576000835103610e6157610e2185610e7c565b610e60576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e5790612441565b60405180910390fd5b5b829050610e74565b610e738383610e9f565b5b949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600082511115610eb25781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ee691906124a5565b60405180910390fd5b6040518060200160405280600081525090565b6000604051905090565b600080fd5b600080fd5b600067ffffffffffffffff82169050919050565b610f3381610f16565b8114610f3e57600080fd5b50565b600081359050610f5081610f2a565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610fa482610f5b565b810181811067ffffffffffffffff82111715610fc357610fc2610f6c565b5b80604052505050565b6000610fd6610f02565b9050610fe28282610f9b565b919050565b600080fd5b600080fd5b600080fd5b600067ffffffffffffffff82111561101157611010610f6c565b5b61101a82610f5b565b9050602081019050919050565b82818337600083830152505050565b600061104961104484610ff6565b610fcc565b90508281526020810184848401111561106557611064610ff1565b5b611070848285611027565b509392505050565b600082601f83011261108d5761108c610fec565b5b813561109d848260208601611036565b91505092915050565b600067ffffffffffffffff8211156110c1576110c0610f6c565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611102826110d7565b9050919050565b611112816110f7565b811461111d57600080fd5b50565b60008135905061112f81611109565b92915050565b6000819050919050565b61114881611135565b811461115357600080fd5b50565b6000813590506111658161113f565b92915050565b60006040828403121561118157611180610f56565b5b61118b6040610fcc565b9050600061119b84828501611120565b60008301525060206111af84828501611156565b60208301525092915050565b60006111ce6111c9846110a6565b610fcc565b905080838252602082019050604084028301858111156111f1576111f06110d2565b5b835b8181101561121a5780611206888261116b565b8452602084019350506040810190506111f3565b5050509392505050565b600082601f83011261123957611238610fec565b5b81356112498482602086016111bb565b91505092915050565b600060a0828403121561126857611267610f56565b5b61127260a0610fcc565b9050600082013567ffffffffffffffff81111561129257611291610fe7565b5b61129e84828501611078565b600083015250602082013567ffffffffffffffff8111156112c2576112c1610fe7565b5b6112ce84828501611078565b602083015250604082013567ffffffffffffffff8111156112f2576112f1610fe7565b5b6112fe84828501611224565b604083015250606061131284828501611120565b606083015250608082013567ffffffffffffffff81111561133657611335610fe7565b5b61134284828501611078565b60808301525092915050565b6000806040838503121561136557611364610f0c565b5b600061137385828601610f41565b925050602083013567ffffffffffffffff81111561139457611393610f11565b5b6113a085828601611252565b9150509250929050565b6113b381611135565b82525050565b60006020820190506113ce60008301846113aa565b92915050565b600080fd5b600060a082840312156113ef576113ee6113d4565b5b81905092915050565b600061ffff82169050919050565b61140f816113f8565b811461141a57600080fd5b50565b60008135905061142c81611406565b92915050565b6000806000806080858703121561144c5761144b610f0c565b5b600085013567ffffffffffffffff81111561146a57611469610f11565b5b611476878288016113d9565b94505060206114878782880161141d565b935050604061149887828801611156565b92505060606114a987828801611120565b91505092959194509250565b60008115159050919050565b6114ca816114b5565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561150a5780820151818401526020810190506114ef565b60008484015250505050565b6000611521826114d0565b61152b81856114db565b935061153b8185602086016114ec565b61154481610f5b565b840191505092915050565b600060608201905061156460008301866114c1565b81810360208301526115768185611516565b905061158560408301846113aa565b949350505050565b600080604083850312156115a4576115a3610f0c565b5b60006115b285828601610f41565b92505060206115c385828601611120565b9150509250929050565b60006020820190506115e260008301846114c1565b92915050565b600060a082840312156115fe576115fd6113d4565b5b81905092915050565b6000806040838503121561161e5761161d610f0c565b5b600061162c85828601610f41565b925050602083013567ffffffffffffffff81111561164d5761164c610f11565b5b611659858286016115e8565b9150509250929050565b6000819050919050565b61167681611663565b82525050565b6000602082019050611691600083018461166d565b92915050565b6000602082840312156116ad576116ac610f0c565b5b60006116bb84828501610f41565b91505092915050565b6116cd816110f7565b82525050565b60006020820190506116e860008301846116c4565b92915050565b6116f781610f16565b82525050565b600060208201905061171260008301846116ee565b92915050565b611721816113f8565b82525050565b600060208201905061173c6000830184611718565b92915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b611777816110f7565b82525050565b6000611789838361176e565b60208301905092915050565b6000602082019050919050565b60006117ad82611742565b6117b7818561174d565b93506117c28361175e565b8060005b838110156117f35781516117da888261177d565b97506117e583611795565b9250506001810190506117c6565b5085935050505092915050565b6000602082019050818103600083015261181a81846117a2565b905092915050565b61182b81611663565b811461183657600080fd5b50565b60008135905061184881611822565b92915050565b600060a0828403121561186457611863610f56565b5b61186e60a0610fcc565b9050600061187e84828501611839565b600083015250602061189284828501610f41565b602083015250604082013567ffffffffffffffff8111156118b6576118b5610fe7565b5b6118c284828501611078565b604083015250606082013567ffffffffffffffff8111156118e6576118e5610fe7565b5b6118f284828501611078565b606083015250608082013567ffffffffffffffff81111561191657611915610fe7565b5b61192284828501611224565b60808301525092915050565b600061193a368361184e565b9050919050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261196d5761196c611941565b5b80840192508235915067ffffffffffffffff82111561198f5761198e611946565b5b6020830192506001820236038313156119ab576119aa61194b565b5b509250929050565b60006119bf83856114db565b93506119cc838584611027565b6119d583610f5b565b840190509392505050565b600060208201905081810360008301526119fb8184866119b3565b90509392505050565b600060208284031215611a1a57611a19610f0c565b5b6000611a2884828501611156565b91505092915050565b600080fd5b600080fd5b600080fd5b60008083356001602003843603038112611a5d57611a5c611a3b565b5b83810192508235915060208301925067ffffffffffffffff821115611a8557611a84611a31565b5b600182023603831315611a9b57611a9a611a36565b5b509250929050565b600082825260208201905092915050565b6000611ac08385611aa3565b9350611acd838584611027565b611ad683610f5b565b840190509392505050565b60008083356001602003843603038112611afe57611afd611a3b565b5b83810192508235915060208301925067ffffffffffffffff821115611b2657611b25611a31565b5b604082023603831315611b3c57611b3b611a36565b5b509250929050565b600082825260208201905092915050565b6000819050919050565b6000611b6e6020840184611120565b905092915050565b6000611b856020840184611156565b905092915050565b611b9681611135565b82525050565b60408201611bad6000830183611b5f565b611bba600085018261176e565b50611bc86020830183611b76565b611bd56020850182611b8d565b50505050565b6000611be78383611b9c565b60408301905092915050565b600082905092915050565b6000604082019050919050565b6000611c178385611b44565b9350611c2282611b55565b8060005b85811015611c5b57611c388284611bf3565b611c428882611bdb565b9750611c4d83611bfe565b925050600181019050611c26565b5085925050509392505050565b600060a08301611c7b6000840184611a40565b8583036000870152611c8e838284611ab4565b92505050611c9f6020840184611a40565b8583036020870152611cb2838284611ab4565b92505050611cc36040840184611ae1565b8583036040870152611cd6838284611c0b565b92505050611ce76060840184611b5f565b611cf4606086018261176e565b50611d026080840184611a40565b8583036080870152611d15838284611ab4565b925050508091505092915050565b60006020820190508181036000830152611d3d8184611c68565b905092915050565b60008083356001602003843603038112611d6257611d61611941565b5b80840192508235915067ffffffffffffffff821115611d8457611d83611946565b5b602083019250604082023603831315611da057611d9f61194b565b5b509250929050565b600060408284031215611dbe57611dbd610f0c565b5b6000611dcc8482850161116b565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600060208284031215611e1a57611e19610f0c565b5b6000611e2884828501611120565b91505092915050565b60006020820190508181036000830152611e4b8184611516565b905092915050565b611e5c81611663565b82525050565b611e6b81610f16565b82525050565b6000611e7c826114d0565b611e868185611aa3565b9350611e968185602086016114ec565b611e9f81610f5b565b840191505092915050565b600081519050919050565b6000819050602082019050919050565b604082016000820151611edb600085018261176e565b506020820151611eee6020850182611b8d565b50505050565b6000611f008383611ec5565b60408301905092915050565b6000602082019050919050565b6000611f2482611eaa565b611f2e8185611b44565b9350611f3983611eb5565b8060005b83811015611f6a578151611f518882611ef4565b9750611f5c83611f0c565b925050600181019050611f3d565b5085935050505092915050565b600060a083016000830151611f8f6000860182611e53565b506020830151611fa26020860182611e62565b5060408301518482036040860152611fba8282611e71565b91505060608301518482036060860152611fd48282611e71565b91505060808301518482036080860152611fee8282611f19565b9150508091505092915050565b600060208201905081810360008301526120158184611f77565b905092915050565b6000608082019050612032600083018761166d565b61203f60208301866116ee565b61204c60408301856116c4565b612059606083018461166d565b95945050505050565b600082905092915050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600082821b905092915050565b60006120b28383612062565b826120bd813561206d565b925060048210156120fd576120f87fffffffff0000000000000000000000000000000000000000000000000000000083600403600802612099565b831692505b505092915050565b600080fd5b600080fd5b6000808585111561212357612122612105565b5b838611156121345761213361210a565b5b6001850283019150848603905094509492505050565b6000602082840312156121605761215f610f56565b5b61216a6020610fcc565b9050600061217a84828501611156565b60008301525092915050565b60006020828403121561219c5761219b610f0c565b5b60006121aa8482850161214a565b91505092915050565b60006060820190506121c860008301866116c4565b6121d560208301856116c4565b6121e260408301846113aa565b949350505050565b6121f3816114b5565b81146121fe57600080fd5b50565b600081519050612210816121ea565b92915050565b60006020828403121561222c5761222b610f0c565b5b600061223a84828501612201565b91505092915050565b600082825260208201905092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b60006122b0602a83612243565b91506122bb82612254565b604082019050919050565b600060208201905081810360008301526122df816122a3565b9050919050565b6122ef8161206d565b82525050565b600060208201905061230a60008301846122e6565b92915050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f60008201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b600061236c602683612243565b915061237782612310565b604082019050919050565b6000602082019050818103600083015261239b8161235f565b9050919050565b600081905092915050565b60006123b8826114d0565b6123c281856123a2565b93506123d28185602086016114ec565b80840191505092915050565b60006123ea82846123ad565b915081905092915050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000600082015250565b600061242b601d83612243565b9150612436826123f5565b602082019050919050565b6000602082019050818103600083015261245a8161241e565b9050919050565b600081519050919050565b600061247782612461565b6124818185612243565b93506124918185602086016114ec565b61249a81610f5b565b840191505092915050565b600060208201905081810360008301526124bf818461246c565b90509291505056fea2646970667358221220b2624868f00a0045aa0e5ec78277661671b73b75bb775cd40434420f66e831de64736f6c63430008170033";

type CustomFeeMockCCIPRouterConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CustomFeeMockCCIPRouterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CustomFeeMockCCIPRouter__factory extends ContractFactory {
  constructor(...args: CustomFeeMockCCIPRouterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      CustomFeeMockCCIPRouter & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): CustomFeeMockCCIPRouter__factory {
    return super.connect(runner) as CustomFeeMockCCIPRouter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CustomFeeMockCCIPRouterInterface {
    return new Interface(_abi) as CustomFeeMockCCIPRouterInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): CustomFeeMockCCIPRouter {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as CustomFeeMockCCIPRouter;
  }
}
