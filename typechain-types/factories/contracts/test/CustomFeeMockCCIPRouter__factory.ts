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
  "0x608060405234801561001057600080fd5b5061257a806100206000396000f3fe60806040526004361061008a5760003560e01c8063a48a905811610059578063a48a90581461017f578063a8d87a3b146101bc578063d6be695a146101f9578063ee18e0d314610224578063fbca3b741461024f57610091565b806320487ded146100965780633cf97983146100d357806383826b2b1461011257806396f4e9f91461014f57610091565b3661009157005b600080fd5b3480156100a257600080fd5b506100bd60048036038101906100b89190611354565b61028c565b6040516100ca91906113bf565b60405180910390f35b3480156100df57600080fd5b506100fa60048036038101906100f59190611438565b610298565b60405161010993929190611555565b60405180910390f35b34801561011e57600080fd5b5061013960048036038101906101349190611593565b6102c3565b60405161014691906115d3565b60405180910390f35b6101696004803603810190610164919061160d565b6102cf565b6040516101769190611682565b60405180910390f35b34801561018b57600080fd5b506101a660048036038101906101a1919061169d565b610655565b6040516101b391906115d3565b60405180910390f35b3480156101c857600080fd5b506101e360048036038101906101de919061169d565b610660565b6040516101f091906116d9565b60405180910390f35b34801561020557600080fd5b5061020e61066e565b60405161021b9190611703565b60405180910390f35b34801561023057600080fd5b50610239610675565b604051610246919061172d565b60405180910390f35b34801561025b57600080fd5b506102766004803603810190610271919061169d565b61067b565b6040516102839190611806565b60405180910390f35b60006001905092915050565b6000606060006102b3876102ab90611934565b8787876106ce565b9250925092509450945094915050565b60006001905092915050565b600060208280600001906102e39190611956565b905014610337578180600001906102fa9190611956565b6040517f370d875f00000000000000000000000000000000000000000000000000000000815260040161032e9291906119e6565b60405180910390fd5b60008280600001906103499190611956565b8101906103569190611a0a565b905073ffffffffffffffffffffffffffffffffffffffff801681118061037c5750600a81105b156103ce578280600001906103919190611956565b6040517f370d875f0000000000000000000000000000000000000000000000000000000081526004016103c59291906119e6565b60405180910390fd5b600081905060006103ed8580608001906103e89190611956565b61088b565b6000015190506000856040516020016104069190611d29565b60405160208183030381529060405280519060200120905060006040518060a0016040528083815260200167de41ba4fc9d91ad967ffffffffffffffff1681526020013360405160200161045a91906116d9565b604051602081830303815290604052815260200188806020019061047e9190611956565b8080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505081526020018880604001906104d69190611d4b565b808060200260200160405190810160405280939291908181526020016000905b82821015610526578484839050604002018036038101906105179190611dae565b815260200190600101906104f6565b5050505050815250905060005b8780604001906105439190611d4b565b90508110156105ec576105db33868a80604001906105619190611d4b565b8581811061057257610571611ddb565b5b905060400201602001358b806040019061058c9190611d4b565b8681811061059d5761059c611ddb565b5b90506040020160000160208101906105b59190611e0a565b73ffffffffffffffffffffffffffffffffffffffff16610974909392919063ffffffff16565b806105e590611e66565b9050610533565b506000806105fe8361138887896106ce565b50915091508161064557806040517f0a8d6e8c00000000000000000000000000000000000000000000000000000000815260040161063c9190611eae565b60405180910390fd5b8397505050505050505092915050565b600060019050919050565b600063499602d29050919050565b62030d4081565b61138881565b6060600067ffffffffffffffff81111561069857610697610f72565b5b6040519080825280602002602001820160405280156106c65781602001602082028036833780820191505090505b509050919050565b600060606000808473ffffffffffffffffffffffffffffffffffffffff163b148061073f575061073d7f85572ffb000000000000000000000000000000000000000000000000000000008573ffffffffffffffffffffffffffffffffffffffff166109fd90919063ffffffff16565b155b1561076457600160006040518060200160405280600081525090925092509250610881565b60006385572ffb60e01b8860405160240161077f9190612078565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090506107ec8186888a6084610a22565b8094508195508296505050507fa8b0355886b5b7a28bb97e4f0a24feb172618407402721c4012d8b7c6433102f84848460405161082b93929190611555565b60405180910390a17f9b877de93ea9895756e337442c657f95a34fc68e7eb988bdfa693d5be83016b688600001518960200151338480519060200120604051610877949392919061209a565b60405180910390a1505b9450945094915050565b610893610ef5565b600083839050036108c157604051806020016040528062030d4067ffffffffffffffff16815250905061096e565b6397a657c960e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168383906108f59190612123565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161461094b576040517f5247fdce00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8282600490809261095e9392919061218c565b81019061096b9190612203565b90505b92915050565b6109f7846323b872dd60e01b85858560405160240161099593929190612230565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610b55565b50505050565b6000610a0883610c1c565b8015610a1a5750610a198383610c69565b5b905092915050565b6000606060008361ffff1667ffffffffffffffff811115610a4657610a45610f72565b5b6040519080825280601f01601f191660200182016040528015610a785781602001600182028036833780820191505090505b509150863b610aab577f0c3b563c0000000000000000000000000000000000000000000000000000000060005260046000fd5b5a85811015610ade577fafa32a2c0000000000000000000000000000000000000000000000000000000060005260046000fd5b85810390508660408204820311610b19577f37c3be290000000000000000000000000000000000000000000000000000000060005260046000fd5b5a6000808b5160208d0160008d8df194505a810392503d86811115610b3c578690505b808552806000602087013e505050955095509592505050565b6000610bb7826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16610d289092919063ffffffff16565b9050600081511115610c175780806020019051810190610bd79190612293565b610c16576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c0d90612343565b60405180910390fd5b5b505050565b6000610c48827f01ffc9a700000000000000000000000000000000000000000000000000000000610c69565b8015610c625750610c608263ffffffff60e01b610c69565b155b9050919050565b6000806301ffc9a760e01b83604051602401610c859190612372565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090506000806000602060008551602087018a617530fa92503d91506000519050828015610d10575060208210155b8015610d1c5750600081115b94505050505092915050565b6060610d378484600085610d40565b90509392505050565b606082471015610d85576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7c906123ff565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051610dae919061245b565b60006040518083038185875af1925050503d8060008114610deb576040519150601f19603f3d011682016040523d82523d6000602084013e610df0565b606091505b5091509150610e0187838387610e0d565b92505050949350505050565b60608315610e6f576000835103610e6757610e2785610e82565b610e66576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e5d906124be565b60405180910390fd5b5b829050610e7a565b610e798383610ea5565b5b949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600082511115610eb85781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610eec9190612522565b60405180910390fd5b6040518060200160405280600081525090565b6000604051905090565b600080fd5b600080fd5b600067ffffffffffffffff82169050919050565b610f3981610f1c565b8114610f4457600080fd5b50565b600081359050610f5681610f30565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610faa82610f61565b810181811067ffffffffffffffff82111715610fc957610fc8610f72565b5b80604052505050565b6000610fdc610f08565b9050610fe88282610fa1565b919050565b600080fd5b600080fd5b600080fd5b600067ffffffffffffffff82111561101757611016610f72565b5b61102082610f61565b9050602081019050919050565b82818337600083830152505050565b600061104f61104a84610ffc565b610fd2565b90508281526020810184848401111561106b5761106a610ff7565b5b61107684828561102d565b509392505050565b600082601f83011261109357611092610ff2565b5b81356110a384826020860161103c565b91505092915050565b600067ffffffffffffffff8211156110c7576110c6610f72565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611108826110dd565b9050919050565b611118816110fd565b811461112357600080fd5b50565b6000813590506111358161110f565b92915050565b6000819050919050565b61114e8161113b565b811461115957600080fd5b50565b60008135905061116b81611145565b92915050565b60006040828403121561118757611186610f5c565b5b6111916040610fd2565b905060006111a184828501611126565b60008301525060206111b58482850161115c565b60208301525092915050565b60006111d46111cf846110ac565b610fd2565b905080838252602082019050604084028301858111156111f7576111f66110d8565b5b835b81811015611220578061120c8882611171565b8452602084019350506040810190506111f9565b5050509392505050565b600082601f83011261123f5761123e610ff2565b5b813561124f8482602086016111c1565b91505092915050565b600060a0828403121561126e5761126d610f5c565b5b61127860a0610fd2565b9050600082013567ffffffffffffffff81111561129857611297610fed565b5b6112a48482850161107e565b600083015250602082013567ffffffffffffffff8111156112c8576112c7610fed565b5b6112d48482850161107e565b602083015250604082013567ffffffffffffffff8111156112f8576112f7610fed565b5b6113048482850161122a565b604083015250606061131884828501611126565b606083015250608082013567ffffffffffffffff81111561133c5761133b610fed565b5b6113488482850161107e565b60808301525092915050565b6000806040838503121561136b5761136a610f12565b5b600061137985828601610f47565b925050602083013567ffffffffffffffff81111561139a57611399610f17565b5b6113a685828601611258565b9150509250929050565b6113b98161113b565b82525050565b60006020820190506113d460008301846113b0565b92915050565b600080fd5b600060a082840312156113f5576113f46113da565b5b81905092915050565b600061ffff82169050919050565b611415816113fe565b811461142057600080fd5b50565b6000813590506114328161140c565b92915050565b6000806000806080858703121561145257611451610f12565b5b600085013567ffffffffffffffff8111156114705761146f610f17565b5b61147c878288016113df565b945050602061148d87828801611423565b935050604061149e8782880161115c565b92505060606114af87828801611126565b91505092959194509250565b60008115159050919050565b6114d0816114bb565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b838110156115105780820151818401526020810190506114f5565b60008484015250505050565b6000611527826114d6565b61153181856114e1565b93506115418185602086016114f2565b61154a81610f61565b840191505092915050565b600060608201905061156a60008301866114c7565b818103602083015261157c818561151c565b905061158b60408301846113b0565b949350505050565b600080604083850312156115aa576115a9610f12565b5b60006115b885828601610f47565b92505060206115c985828601611126565b9150509250929050565b60006020820190506115e860008301846114c7565b92915050565b600060a08284031215611604576116036113da565b5b81905092915050565b6000806040838503121561162457611623610f12565b5b600061163285828601610f47565b925050602083013567ffffffffffffffff81111561165357611652610f17565b5b61165f858286016115ee565b9150509250929050565b6000819050919050565b61167c81611669565b82525050565b60006020820190506116976000830184611673565b92915050565b6000602082840312156116b3576116b2610f12565b5b60006116c184828501610f47565b91505092915050565b6116d3816110fd565b82525050565b60006020820190506116ee60008301846116ca565b92915050565b6116fd81610f1c565b82525050565b600060208201905061171860008301846116f4565b92915050565b611727816113fe565b82525050565b6000602082019050611742600083018461171e565b92915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61177d816110fd565b82525050565b600061178f8383611774565b60208301905092915050565b6000602082019050919050565b60006117b382611748565b6117bd8185611753565b93506117c883611764565b8060005b838110156117f95781516117e08882611783565b97506117eb8361179b565b9250506001810190506117cc565b5085935050505092915050565b6000602082019050818103600083015261182081846117a8565b905092915050565b61183181611669565b811461183c57600080fd5b50565b60008135905061184e81611828565b92915050565b600060a0828403121561186a57611869610f5c565b5b61187460a0610fd2565b905060006118848482850161183f565b600083015250602061189884828501610f47565b602083015250604082013567ffffffffffffffff8111156118bc576118bb610fed565b5b6118c88482850161107e565b604083015250606082013567ffffffffffffffff8111156118ec576118eb610fed565b5b6118f88482850161107e565b606083015250608082013567ffffffffffffffff81111561191c5761191b610fed565b5b6119288482850161122a565b60808301525092915050565b60006119403683611854565b9050919050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261197357611972611947565b5b80840192508235915067ffffffffffffffff8211156119955761199461194c565b5b6020830192506001820236038313156119b1576119b0611951565b5b509250929050565b60006119c583856114e1565b93506119d283858461102d565b6119db83610f61565b840190509392505050565b60006020820190508181036000830152611a018184866119b9565b90509392505050565b600060208284031215611a2057611a1f610f12565b5b6000611a2e8482850161115c565b91505092915050565b600080fd5b600080fd5b600080fd5b60008083356001602003843603038112611a6357611a62611a41565b5b83810192508235915060208301925067ffffffffffffffff821115611a8b57611a8a611a37565b5b600182023603831315611aa157611aa0611a3c565b5b509250929050565b600082825260208201905092915050565b6000611ac68385611aa9565b9350611ad383858461102d565b611adc83610f61565b840190509392505050565b60008083356001602003843603038112611b0457611b03611a41565b5b83810192508235915060208301925067ffffffffffffffff821115611b2c57611b2b611a37565b5b604082023603831315611b4257611b41611a3c565b5b509250929050565b600082825260208201905092915050565b6000819050919050565b6000611b746020840184611126565b905092915050565b6000611b8b602084018461115c565b905092915050565b611b9c8161113b565b82525050565b60408201611bb36000830183611b65565b611bc06000850182611774565b50611bce6020830183611b7c565b611bdb6020850182611b93565b50505050565b6000611bed8383611ba2565b60408301905092915050565b600082905092915050565b6000604082019050919050565b6000611c1d8385611b4a565b9350611c2882611b5b565b8060005b85811015611c6157611c3e8284611bf9565b611c488882611be1565b9750611c5383611c04565b925050600181019050611c2c565b5085925050509392505050565b600060a08301611c816000840184611a46565b8583036000870152611c94838284611aba565b92505050611ca56020840184611a46565b8583036020870152611cb8838284611aba565b92505050611cc96040840184611ae7565b8583036040870152611cdc838284611c11565b92505050611ced6060840184611b65565b611cfa6060860182611774565b50611d086080840184611a46565b8583036080870152611d1b838284611aba565b925050508091505092915050565b60006020820190508181036000830152611d438184611c6e565b905092915050565b60008083356001602003843603038112611d6857611d67611947565b5b80840192508235915067ffffffffffffffff821115611d8a57611d8961194c565b5b602083019250604082023603831315611da657611da5611951565b5b509250929050565b600060408284031215611dc457611dc3610f12565b5b6000611dd284828501611171565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600060208284031215611e2057611e1f610f12565b5b6000611e2e84828501611126565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611e718261113b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611ea357611ea2611e37565b5b600182019050919050565b60006020820190508181036000830152611ec8818461151c565b905092915050565b611ed981611669565b82525050565b611ee881610f1c565b82525050565b6000611ef9826114d6565b611f038185611aa9565b9350611f138185602086016114f2565b611f1c81610f61565b840191505092915050565b600081519050919050565b6000819050602082019050919050565b604082016000820151611f586000850182611774565b506020820151611f6b6020850182611b93565b50505050565b6000611f7d8383611f42565b60408301905092915050565b6000602082019050919050565b6000611fa182611f27565b611fab8185611b4a565b9350611fb683611f32565b8060005b83811015611fe7578151611fce8882611f71565b9750611fd983611f89565b925050600181019050611fba565b5085935050505092915050565b600060a08301600083015161200c6000860182611ed0565b50602083015161201f6020860182611edf565b50604083015184820360408601526120378282611eee565b915050606083015184820360608601526120518282611eee565b9150506080830151848203608086015261206b8282611f96565b9150508091505092915050565b600060208201905081810360008301526120928184611ff4565b905092915050565b60006080820190506120af6000830187611673565b6120bc60208301866116f4565b6120c960408301856116ca565b6120d66060830184611673565b95945050505050565b600082905092915050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600082821b905092915050565b600061212f83836120df565b8261213a81356120ea565b9250600482101561217a576121757fffffffff0000000000000000000000000000000000000000000000000000000083600403600802612116565b831692505b505092915050565b600080fd5b600080fd5b600080858511156121a05761219f612182565b5b838611156121b1576121b0612187565b5b6001850283019150848603905094509492505050565b6000602082840312156121dd576121dc610f5c565b5b6121e76020610fd2565b905060006121f78482850161115c565b60008301525092915050565b60006020828403121561221957612218610f12565b5b6000612227848285016121c7565b91505092915050565b600060608201905061224560008301866116ca565b61225260208301856116ca565b61225f60408301846113b0565b949350505050565b612270816114bb565b811461227b57600080fd5b50565b60008151905061228d81612267565b92915050565b6000602082840312156122a9576122a8610f12565b5b60006122b78482850161227e565b91505092915050565b600082825260208201905092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b600061232d602a836122c0565b9150612338826122d1565b604082019050919050565b6000602082019050818103600083015261235c81612320565b9050919050565b61236c816120ea565b82525050565b60006020820190506123876000830184612363565b92915050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f60008201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b60006123e96026836122c0565b91506123f48261238d565b604082019050919050565b60006020820190508181036000830152612418816123dc565b9050919050565b600081905092915050565b6000612435826114d6565b61243f818561241f565b935061244f8185602086016114f2565b80840191505092915050565b6000612467828461242a565b915081905092915050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000600082015250565b60006124a8601d836122c0565b91506124b382612472565b602082019050919050565b600060208201905081810360008301526124d78161249b565b9050919050565b600081519050919050565b60006124f4826124de565b6124fe81856122c0565b935061250e8185602086016114f2565b61251781610f61565b840191505092915050565b6000602082019050818103600083015261253c81846124e9565b90509291505056fea2646970667358221220d5a4c5533abaeedbde417345e66113a4600c28c880d9f58bf065b989552800f764736f6c63430008130033";

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
