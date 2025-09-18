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
  symbol: 'bIBTA',
  variant: 0n,
}

describe("CCIP Integration", function () {
 it("Should transfer tokens through CCIP from EOA to EOA using mocks", async function () {
    const [client, systemWallet] = await hre.ethers.getSigners();

    // Use mock router instead of forking
    const ccipLocalSimualtorFactory = await hre.ethers.getContractFactory(
      "CustomFeeCCIPLocalSimulator"
    );
    const ccipLocalSimulator = await ccipLocalSimualtorFactory.deploy();

    const {
      chainSelector_: sourceChainSelector,
      sourceRouter_: sourceRouterAddress
    } = await ccipLocalSimulator.configuration();

    const destinationChainSelector = sourceChainSelector + 1n;
    const destinationRouterAddress = sourceRouterAddress; // Use same mock router

    const factory = await hre.ethers.getContractFactory(
      "BackedCCIPReceiver"
    );
    const backedCCIPReceiverOnSourceChain =
      await hre.upgrades.deployProxy(factory, [sourceRouterAddress, systemWallet.address]) as unknown as BackedCCIPReceiver;

    const backedCCIPSourceChainAddress = await backedCCIPReceiverOnSourceChain.getAddress();

    console.log(`Deployed Backed CCIP receiver on ${sourceChainSelector}: ${backedCCIPSourceChainAddress}`);

    const tokenFactory = await hre.ethers.getContractFactory(
      'ERC20Mock'
    );
    const tokenOnSourceChain = await tokenFactory.deploy(token.name, token.symbol);
    const tokenOnSourceChainAddress = await tokenOnSourceChain.getAddress();

    console.log(`Deployed Backed IBTA on ${sourceChainSelector}: ${tokenOnSourceChainAddress}`);

    await backedCCIPReceiverOnSourceChain.registerToken(tokenOnSourceChainAddress, token.id, token.variant);

    await tokenOnSourceChain.mint(client, 10_000_000_000_000_000_000n);

    await tokenOnSourceChain.approve(backedCCIPReceiverOnSourceChain, 1_000_000_000_000_000_000n);

    await backedCCIPReceiverOnSourceChain.registerDestinationChain(
      destinationChainSelector, 
      hre.ethers.zeroPadValue(backedCCIPSourceChainAddress, 32),
      0n, // EVM_CHAIN_VARIANT
      200_000n
    );

    let custodyBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(systemWallet.address);
    let clientBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(client.address);
    expect(custodyBalanceOnSourceChain).to.deep.equal(0n)
    expect(clientBalanceOnSourceChain).to.deep.equal(10_000_000_000_000_000_000n)

    const feeCosts = await backedCCIPReceiverOnSourceChain.connect(client).getDeliveryFeeCost(
      destinationChainSelector, 
      hre.ethers.zeroPadValue(client.address, 32), 
      tokenOnSourceChainAddress, 
      1_000_000_000_000_000_000n,
      "0x"
    )

    console.log(`Custody balance on source chain: ${custodyBalanceOnSourceChain}`);
    console.log(`Client balance on source chain: ${clientBalanceOnSourceChain}`);
    const tx = await backedCCIPReceiverOnSourceChain.connect(client).send(
      destinationChainSelector, 
      hre.ethers.zeroPadValue(client.address, 32), 
      tokenOnSourceChainAddress, 
      1_000_000_000_000_000_000n,
      "0x",
      { value: feeCosts }
    );
    const receipt = await tx.wait();

    custodyBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(systemWallet.address);
    clientBalanceOnSourceChain = await tokenOnSourceChain.balanceOf(client.address);
    console.log(`Custody wallet post tx balance on source chain: ${custodyBalanceOnSourceChain}`);
    console.log(`Sender wallet post tx balance on source chain: ${clientBalanceOnSourceChain}`);
    expect(custodyBalanceOnSourceChain).to.deep.equal(1_000_000_000_000_000_000n)
    expect(clientBalanceOnSourceChain).to.deep.equal(10_000_000_000_000_000_000n - 1_000_000_000_000_000_000n)

    // Create a mock CCIP message for testing (instead of extracting from receipt)
    const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
    const evm2EvmMessage = {
      messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
      sourceChainSelector: sourceChainSelector,
      sender: backedCCIPSourceChainAddress,
      data: hre.ethers.solidityPacked(
        ["bytes32", "uint64", "uint256", "uint8", "bytes"],
        [hre.ethers.zeroPadValue(client.address, 32), token.id, 1_000_000_000_000_000_000n, token.variant, "0x"]
      ),
      receiver: "", // Will be set below
    };

    // Simulate destination chain on same network (no forking needed)
    const factoryOnDestinationChain = await hre.ethers.getContractFactory(
      "BackedCCIPReceiver"
    );

    const backedCCIPReceiverOnDestinationChainProxy =
      await hre.upgrades.deployProxy(factoryOnDestinationChain, [destinationRouterAddress, systemWallet.address]) as unknown as BackedCCIPReceiver;

    const backedCCIPReceiverOnDestinationChain = factoryOnDestinationChain.attach(backedCCIPReceiverOnDestinationChainProxy) as BackedCCIPReceiver;

    const backedCCIPReceiverAddressOnDestinationChain = await backedCCIPReceiverOnDestinationChain.getAddress();

    console.log(`Deployed Backed CCIP receiver on ${destinationChainSelector}: ${backedCCIPReceiverAddressOnDestinationChain}`);

    const tokenFactoryOnDestinationChain = await hre.ethers.getContractFactory(
      'ERC20Mock'
    );
    const tokenOnDestinationChain = await tokenFactoryOnDestinationChain.deploy('Backed IBTA', 'bIBTA');
    const tokenAddressOnDestinationChain = await tokenOnDestinationChain.getAddress();

    console.log(`Deployed Backed IBTA on ${destinationChainSelector}: ${tokenAddressOnDestinationChain}`);

    await backedCCIPReceiverOnDestinationChain.registerToken(tokenAddressOnDestinationChain, token.id, token.variant);
    await backedCCIPReceiverOnDestinationChain.registerSourceChain(sourceChainSelector, hre.ethers.zeroPadValue(backedCCIPSourceChainAddress, 32));

    await tokenOnDestinationChain.mint(systemWallet, 10_000_000_000_000_000_000n);
    await tokenOnDestinationChain.connect(systemWallet).approve(backedCCIPReceiverAddressOnDestinationChain, 10_000_000_000_000_000_000n);


    let systemWalletBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(systemWallet.address);
    let clientBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(client.address);


    expect(systemWalletBalanceOnDestinationChain).to.deep.equal(10_000_000_000_000_000_000n)
    expect(clientBalanceOnDestinationChain).to.deep.equal(0n)

    console.log(`System wallet balance on destination chain: ${systemWalletBalanceOnDestinationChain}`);
    console.log(`Client balance on destination chain: ${clientBalanceOnDestinationChain}`);

    // Simulate CCIP message processing directly
    const router = await hre.ethers.getImpersonatedSigner(destinationRouterAddress);
    
    // Fund the router for gas
    await client.sendTransaction({
      to: destinationRouterAddress,
      value: hre.ethers.parseEther("1")
    });

    const ccipMessage = {
      messageId: evm2EvmMessage.messageId,
      sourceChainSelector: evm2EvmMessage.sourceChainSelector,
      sender: defaultAbiCoder.encode(['bytes32'], [hre.ethers.zeroPadValue(evm2EvmMessage.sender, 32)]),
      data: evm2EvmMessage.data,
      destTokenAmounts: [],
    };

    await backedCCIPReceiverOnDestinationChain.connect(router).ccipReceive(ccipMessage);

    systemWalletBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(systemWallet.address);
    clientBalanceOnDestinationChain = await tokenOnDestinationChain.balanceOf(client.address);
    console.log(`System wallet balance post tx on destination chain: ${systemWalletBalanceOnDestinationChain}`);
    console.log(`Client balance post tx on destination chain: ${clientBalanceOnDestinationChain}`);

    expect(systemWalletBalanceOnDestinationChain).to.deep.equal(10_000_000_000_000_000_000n - 1_000_000_000_000_000_000n)
    expect(clientBalanceOnDestinationChain).to.deep.equal(1_000_000_000_000_000_000n)
  });
});