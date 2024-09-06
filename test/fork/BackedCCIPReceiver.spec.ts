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
import { BackedCCIPReceiver__factory } from "../../typechain-types/factories/contracts/BackedCCIPReceiver.sol";

const token = {
  id: 1337,
  name: 'Backed IBTA',
  symbol: 'bIBTA'
}

describe("CCIP Integration", function () {
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

    await hre.network.provider.request({
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
    const backedCCIPReceiverOnSourceChain =
      await hre.upgrades.deployProxy(factory, [sourceRouterAddress, systemWallet.address, 200_000]) as unknown as BackedCCIPReceiver;

    const backedCCIPSourceChainAddress = await backedCCIPReceiverOnSourceChain.getAddress();

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

    const backedCCIPReceiverOnDestinationChainProxy =
      await hre.upgrades.deployProxy(factoryOnDestinationChain, [destinationRouterAddress, systemWallet.address, 200_000]) as unknown as BackedCCIPReceiver;

    const backedCCIPReceiverOnDestinationChain = factoryOnDestinationChain.attach(backedCCIPReceiverOnDestinationChainProxy) as BackedCCIPReceiver;

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

    await tokenOnDestinationChain.mint(systemWallet, 10_000_000_000_000_000_000n);
    await tokenOnDestinationChain.connect(systemWallet).approve(backedCCIPReceiverAddressOnDestinationChain, 10_000_000_000_000_000_000n);


    let systemWalletBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(systemWallet.address);
    let clientBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(client.address);


    expect(systemWalletBalanceOnDestinationChain).to.deep.equal(10_000_000_000_000_000_000n)
    expect(clientBalanceOnDestinationChain).to.deep.equal(0n)

    console.log(`System wallet balance on destination chain: ${systemWalletBalanceOnDestinationChain}`);
    console.log(`Client balance on destination chain: ${clientBalanceOnDestinationChain}`);

    // Create an interface for the receiver contract using its factory.
    const receiverInterface = BackedCCIPReceiver__factory.createInterface();

    const coder = hre.ethers.AbiCoder.defaultAbiCoder();

    const transactionData = receiverInterface.encodeFunctionData("ccipReceive", [
      {
        messageId: evm2EvmMessage.messageId,
        sourceChainSelector: evm2EvmMessage.sourceChainSelector,
        sender: coder.encode(['address'], [evm2EvmMessage.sender]),
        data: evm2EvmMessage.data,
        destTokenAmounts: [],
      },
    ]);

    try {
      const estimate = await hre.ethers.provider.estimateGas({
        from: destinationRouterAddress,
        to: backedCCIPReceiverAddressOnDestinationChain,
        data: transactionData
      });
      console.log(estimate);
    } catch (e) {
      debugger;
      console.log(e);
    }


    await routeMessage(destinationRouterAddress, {
      ...evm2EvmMessage,
      receiver: backedCCIPReceiverAddressOnDestinationChain
    });

    systemWalletBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(systemWallet.address);
    clientBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(client.address);
    console.log(`System wallet balance post tx on destination chain: ${systemWalletBalanceOnDestinationChain}`);
    console.log(`Client balance post tx on destination chain: ${clientBalanceOnDestinationChain}`);

    expect(systemWalletBalanceOnDestinationChain).to.deep.equal(10_000_000_000_000_000_000n - 1_000_000_000_000_000_000n)
    expect(clientBalanceOnDestinationChain).to.deep.equal(1_000_000_000_000_000_000n)
  });
});