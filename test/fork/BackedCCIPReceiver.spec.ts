import { expect } from "chai";
import hre from "hardhat";
import {
  getEvm2EvmMessage,
  routeMessage,
} from "@chainlink/local/scripts/CCIPLocalSimulatorFork";
import {
  BackedCCIPReceiver,
} from "../../typechain-types";
import {
  getProviderRpcUrl,
  getRouterConfig,
} from "../../helpers/utils";

const token = {
  id: 1337,
  name: 'Backed IBTA',
  symbol: 'bIBTA'
}

describe("Integration", function () {
  it("Should transfer tokens through CCIP from EOA to EOA", async function () {
    const [client, systemWallet] = await hre.ethers.getSigners();
    const [source, destination] = ["ethereumSepolia", "arbitrumSepolia"];

    const {
      address: sourceRouterAddress,
      chainSelector: sourceChainSelector,
    } = getRouterConfig(source);

    const {
      address: destinationRouterAddress,
      chainSelector: destinationChainSelector,
    } = getRouterConfig(destination);

    const x = await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: getProviderRpcUrl(source),
          },
        },
      ],
    });

    const factory = await hre.ethers.getContractFactory(
      "BackedCCIPReceiver"
    );
    const backedCCIPReceiverOnSourceChain: BackedCCIPReceiver =
      await factory.deploy(sourceRouterAddress, systemWallet.address);
    const backedCCIPSourceChainAddress = await backedCCIPReceiverOnSourceChain.getAddress();

    // transfer Native coins from sender to the Smart Contract for fees
    await client.sendTransaction({
      to: backedCCIPSourceChainAddress,
      value: 1_000_000_000_000_000_000n,
    });

    console.log(`Deployed Backed CCIP receiver on ${sourceChainSelector}: ${backedCCIPSourceChainAddress}`);

    const tokenFactory = await hre.ethers.getContractFactory(
      'ERC20Mock'
    );
    const tokenOnSourceChain = await tokenFactory.deploy(token.name, token.symbol);
    const tokenOnSourceChainAddress = await tokenOnSourceChain.getAddress();

    console.log(`Deployed Backed IBTA on ${sourceChainSelector}: ${tokenOnSourceChainAddress}`);

    await backedCCIPReceiverOnSourceChain.registerToken(tokenOnSourceChainAddress, token.id);

    await tokenOnSourceChain.mint(client, 10_000_000_000_000_000_000n);

    await tokenOnSourceChain.approve(backedCCIPReceiverOnSourceChain, 1_000_000_000_000_000_000n);

    await backedCCIPReceiverOnSourceChain.registerDestinationChain(destinationChainSelector, backedCCIPSourceChainAddress);

    let custodyBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(systemWallet.address);
    let clientBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(client.address);
    expect(custodyBalanceOnSourceChain).to.deep.equal(0n)
    expect(clientBalanceOnSourceChain).to.deep.equal(10_000_000_000_000_000_000n)

    const feeCosts = await backedCCIPReceiverOnSourceChain.connect(client).getDeliveryFeeCost(destinationChainSelector, tokenOnSourceChainAddress, 1_000_000_000_000_000_000n)

    console.log(`Custody balance on source chain: ${custodyBalanceOnSourceChain}`);
    console.log(`Client balance on source chain: ${clientBalanceOnSourceChain}`);
    const tx = await backedCCIPReceiverOnSourceChain.connect(client).send(destinationChainSelector, tokenOnSourceChainAddress, 1_000_000_000_000_000_000n, { value: feeCosts });
    const receipt = await tx.wait();

    custodyBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(systemWallet.address);
    clientBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(client.address);
    console.log(`Custody wallet post tx balance on source chain: ${custodyBalanceOnSourceChain}`);
    console.log(`Sender wallet post tx balance on source chain: ${clientBalanceOnSourceChain}`);
    expect(custodyBalanceOnSourceChain).to.deep.equal(1_000_000_000_000_000_000n)
    expect(clientBalanceOnSourceChain).to.deep.equal(10_000_000_000_000_000_000n - 1_000_000_000_000_000_000n)

    const evm2EvmMessage = getEvm2EvmMessage(receipt);
    if (!evm2EvmMessage) throw Error("EVM2EVM message not found");

    // Destination chain
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: getProviderRpcUrl(destination),
          },
        },
      ],
    });

    const factoryOnDestinationChain = await hre.ethers.getContractFactory(
      "BackedCCIPReceiver"
    );
    const backedCCIPReceiverOnDestinationChain: BackedCCIPReceiver =
      await factoryOnDestinationChain.deploy(destinationRouterAddress, systemWallet.address);
    const backedCCIPReceiverAddressOnDestinationChain = await backedCCIPReceiverOnDestinationChain.getAddress();

    console.log(`Deployed Backed CCIP receiver on ${destinationChainSelector}: ${backedCCIPReceiverAddressOnDestinationChain}`);

    const tokenFactoryOnDestinationChain = await hre.ethers.getContractFactory(
      'ERC20Mock'
    );
    const tokenOnDestinationChain = await tokenFactoryOnDestinationChain.deploy('Backed IBTA', 'bIBTA');
    const tokenAddressOnDestinationChain = await tokenOnDestinationChain.getAddress();

    console.log(`Deployed Backed IBTA on ${destinationChainSelector}: ${tokenAddressOnDestinationChain}`);

    await backedCCIPReceiverOnDestinationChain.registerToken(tokenAddressOnDestinationChain, token.id);
    await backedCCIPReceiverOnDestinationChain.allowlistSender(backedCCIPSourceChainAddress, true);
    await backedCCIPReceiverOnDestinationChain.allowlistSourceChain(sourceChainSelector, true);

    await tokenOnDestinationChain.mint(backedCCIPReceiverAddressOnDestinationChain, 10_000_000_000_000_000_000n);


    let backedCCIPReceiverBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(backedCCIPReceiverAddressOnDestinationChain);
    let clientBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(client.address);


    expect(backedCCIPReceiverBalanceOnDestinationChain).to.deep.equal(10_000_000_000_000_000_000n)
    expect(clientBalanceOnDestinationChain).to.deep.equal(0n)

    console.log(`Backed CCIP receiver contract balance on destination chain: ${backedCCIPReceiverBalanceOnDestinationChain}`);
    console.log(`Client balance on destination chain: ${clientBalanceOnDestinationChain}`);

    console.log(destinationRouterAddress)
    console.log(evm2EvmMessage.sender);

    await routeMessage(destinationRouterAddress, {
      ...evm2EvmMessage,
      receiver: backedCCIPReceiverAddressOnDestinationChain
    });

    backedCCIPReceiverBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(backedCCIPReceiverAddressOnDestinationChain);
    clientBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(client.address);
    console.log(`Backed CCIP receiver contract balance post tx on destination chain: ${backedCCIPReceiverBalanceOnDestinationChain}`);
    console.log(`Client balance post tx on destination chain: ${clientBalanceOnDestinationChain}`);

    expect(backedCCIPReceiverBalanceOnDestinationChain).to.deep.equal(10_000_000_000_000_000_000n - 1_000_000_000_000_000_000n)
    expect(clientBalanceOnDestinationChain).to.deep.equal(1_000_000_000_000_000_000n)
  });
});