## Backed CCIP bridge

The BackedCCIPReceiver contract is designed to facilitate cross-chain token transfers and messaging using Chainlink's Cross-Chain Interoperability Protocol (CCIP).
* It allows users to send tokens to a custody wallet on the source chain and receive equivalent tokens on the destination chain, leveraging CCIP to relay messages between chains.
* This contract assumes that custody wallet approval for this contract to transfer tokens will be managed off-chain.

## Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Current LTS Node.js version](https://nodejs.org/en/about/releases/)

Verify installation by typing:

```shell
node -v
```

and

```shell
npm -v
```

## Getting Started

1. Install packages

```
npm install
```

2. Compile contracts

```
npm run compile
```

## What is Chainlink CCIP?

**Chainlink Cross-Chain Interoperability Protocol (CCIP)** provides a single, simple, and elegant interface through which dApps and web3 entrepreneurs can securely meet all their cross-chain needs, including token transfers and arbitrary messaging.

![basic-architecture](./img/basic-architecture.png)

With Chainlink CCIP, one can:

- Transfer supported tokens
- Send messages (any data)
- Send messages and tokens

CCIP receiver can be:

- Smart contract that implements `CCIPReceiver.sol`
- EOA

**Note**: If you send a message and token(s) to EOA, only tokens will arrive

To use this project, you can consider CCIP as a "black-box" component and be aware of the Router contract only. If you want to dive deep into it, check the [Official Chainlink Documentation](https://docs.chain.link/ccip).

## Usage

We are going to use the [`@chainlink/env-enc`](https://www.npmjs.com/package/@chainlink/env-enc) package for extra security. It encrypts sensitive data instead of storing them as plain text in the `.env` file, by creating a new, `.env.enc` file. Although it's not recommended to push this file online, if that accidentally happens your secrets will still be encrypted.

1. Set a password for encrypting and decrypting the environment variable file. You can change it later by typing the same command.

```shell
npx env-enc set-pw
```

2. Now set the following environment variables: `PRIVATE_KEY`, Source Blockchain RPC URL, Destination Blockchain RPC URL. You can see available options in the `.env.example` file or check out the [latest supported networks in the docs](https://docs.chain.link/ccip/supported-networks):

```shell
ETHEREUM_SEPOLIA_RPC_URL=""
OPTIMISM_SEPOLIA_RPC_URL=""
ARBITRUM_SEPOLIA_RPC_URL=""
AVALANCHE_FUJI_RPC_URL=""
POLYGON_AMOY_RPC_URL=""
BNB_CHAIN_TESTNET_RPC_URL=""
BASE_SEPOLIA_RPC_URL=""
KROMA_SEPOLIA_RPC_URL=""
WEMIX_TESTNET_RPC_URL=""
GNOSIS_CHIADO_RPC_URL=""
CELO_ALFAJORES_RPC_URL=""
METIS_SEPOLIA_RPC_URL=""
ZKSYNC_SEPOLIA_RPC_URL=""
```

To set these variables, type the following command and follow the instructions in the terminal:

```shell
npx env-enc set
```

After you are done, the `.env.enc` file will be automatically generated.

If you want to validate your inputs you can always run the next command:

```shell
npx env-enc view
```

### Test

There are two types of tests in this project:

- **./test/no-fork/**: These tests run on your local hardhat node and do not require forking.
- **./test/fork/**: These tests run on a forked mainnet network and require forking the source and destination blockchains.

#### No Fork

To run the tests that do not require forking, type:

```shell
npm run test:no-fork
```

#### Fork

The tests are forking _Arbitrum Sepolia_ as source chain and _Ethereum Sepolia_ as destination chain. Before you begin, make sure to set up the rpc urls in your `.env.enc` file.

To run the tests that require forking, type:

```shell
npm run test:fork
```


## Tasks

#### Deploy
Deploys Backed CCIP bridge contract to destination chain.

```shell
npx hardhat deploy-backed-ccip-receiver --network $NETWORK
```
Optional parameters:
- `router` the address of the CCIP Router contract
- `custodyWallet` the address of the custody wallet
- `gasLimit` initial value for default CCIP execution gas limit on destination chain

#### Register destination chain
Registers receiver contract on specified chain allowing to bridge to specified destination.

```shell
npx hardhat register-destination-chain --network $NETWORK --receiver $RECEIVER_ADDRESS --destination-chain-selector $CHAIN_SELECTOR
```
Parameters:
- `receiver` Backed CCIP receiver contract address
- `destination-chain-selector` CCIP destination chain selector

#### Register source chain
Registers sender contract on specified chain allowing to receive bridge messaged from specified destination.

```shell
npx hardhat register-source-chain --network $NETWORK --sender $RECEIVER_ADDRESS --source-chain-scelector $CHAIN_SELECTOR
```
Parameters:
- `sender` Backed CCIP sender contract address
- `source-chain-selector` CCIP source chain selector

#### Remove source chain
Removes specified chain from the contract to disable bridging from the chain.

```shell
npx hardhat remove-source-chain --network $NETWORK --source-chain-scelector $CHAIN_SELECTOR
```
Parameters:
- `source-chain-selector` CCIP source chain selector
#### Register lanes
Registers specified networks as both source and destination chains
```shell
npx hardhat register-lanes --network $NETWORK
```

#### Register token
Registers specified token to allow to bridging of this asset
```shell
npx hardhat register-token --network $NETWORK --token $TOKEN_ADDRESS --token-id $TOKEN_ID --token-variant $TOKEN_VARIANT
```
Parameters:
- `token` Backed token address
- `token-id` arbitrary token ID
- `token-variant` token variant (constant ratio - 0 or multiplier fee - 1)

#### Remove token
Removes specified token from the contract to disable bridging of this asset
```shell
npx hardhat remove-token --network $NETWORK --token $TOKEN_ADDRESS
```
Parameters:
- `token` Backed token address

