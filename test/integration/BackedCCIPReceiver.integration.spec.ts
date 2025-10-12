import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import {
  BackedCCIPReceiver,
} from "../../typechain-types";

const EVM_CHAIN_VARIANT = 0n;

describe("CCIP Integration - Cross-Chain Tests", function () {
  async function deployFixture() {
    const [client, systemWallet] = await hre.ethers.getSigners();

    const ccipLocalSimualtorFactory = await hre.ethers.getContractFactory(
      "CustomFeeCCIPLocalSimulator"
    );
    const ccipLocalSimulator = await ccipLocalSimualtorFactory.deploy();

    const {
      chainSelector_: chainSelector,
      sourceRouter_: router
    } = await ccipLocalSimulator.configuration();

    return { client, systemWallet, chainSelector, router };
  }

  it("Should complete end-to-end auto fee token transfer using shares", async function () {
    const { client, systemWallet, chainSelector, router } = await loadFixture(deployFixture);

    // Deploy contracts
    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    const sourceChainReceiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;
    const destinationChainReceiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;

    // Deploy auto fee tokens (shares-based)
    const tokenFactory = await hre.ethers.getContractFactory('ERC20AutoFeeMock');
    const sourceToken = await tokenFactory.deploy("Test Token", "TEST");
    const destinationToken = await tokenFactory.deploy("Test Token", "TEST");

    const tokenId = 1337n;
    const transferAmount = 1_000_000_000_000_000_000n;

    // Setup configurations
    await sourceChainReceiver.registerDestinationChain(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(await destinationChainReceiver.getAddress(), 32),
      EVM_CHAIN_VARIANT,
      200_000n
    );
    await sourceChainReceiver.registerToken(await sourceToken.getAddress(), tokenId);
    await destinationChainReceiver.registerSourceChain(
      chainSelector,
      hre.ethers.zeroPadValue(await sourceChainReceiver.getAddress(), 32)
    );
    await destinationChainReceiver.registerToken(await destinationToken.getAddress(), tokenId);

    // Setup balances
    await sourceToken.mint(client, 10_000_000_000_000_000_000n);
    await sourceToken.connect(client).approve(await sourceChainReceiver.getAddress(), transferAmount);
    await destinationToken.mint(systemWallet, 10_000_000_000_000_000_000n);
    await destinationToken.connect(systemWallet).approve(await destinationChainReceiver.getAddress(), 10_000_000_000_000_000_000n);

    // Send tokens
    const feeCosts = await sourceChainReceiver.connect(client).getDeliveryFeeCost(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(client.address, 32),
      await sourceToken.getAddress(),
      transferAmount,
      "0x"
    );

    await sourceChainReceiver.connect(client).send(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(client.address, 32),
      await sourceToken.getAddress(),
      transferAmount,
      "0x",
      { value: feeCosts }
    );

    // Simulate CCIP processing with new shares-based message format
    const router_signer = await hre.ethers.getImpersonatedSigner(router);
    await client.sendTransaction({ to: router, value: hre.ethers.parseEther("1") });

    // Get shares amount for the transfer (1:1 for default multiplier)
    const sharesAmount = await sourceToken.getSharesByUnderlyingAmount(transferAmount);

    const ccipMessage = {
      messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
      sourceChainSelector: chainSelector,
      sender: hre.ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [hre.ethers.zeroPadValue(await sourceChainReceiver.getAddress(), 32)]),
      data: hre.ethers.solidityPacked(
        ["bytes32", "uint64", "uint256"],
        [hre.ethers.zeroPadValue(client.address, 32), tokenId, sharesAmount]
      ),
      destTokenAmounts: [],
    };

    await destinationChainReceiver.connect(router_signer).ccipReceive(ccipMessage);

    // Verify transfer completed with exact amounts
    const sourceCustodyBalance = await sourceToken.balanceOf(systemWallet.address);
    const destCustodyBalance = await destinationToken.balanceOf(systemWallet.address);
    const clientDestBalance = await destinationToken.balanceOf(client.address);

    // FAILING: Contract encodes both _amount and _sharesAmount (line 356), but receiver reads bytes 40-72 as shares (which contains _amount).
    // This causes receiver to transfer _amount as if it were shares, resulting in incorrect token amounts on destination chain.
    expect(sourceCustodyBalance).to.equal(transferAmount); // Source custody received exact transfer amount
    expect(clientDestBalance).to.equal(transferAmount); // Client received exact transfer amount on destination
    expect(destCustodyBalance).to.equal(10_000_000_000_000_000_000n - transferAmount); // Destination custody has remaining balance

    // Verify shares are preserved (1:1 with multiplier 1.0)
    expect(sharesAmount).to.equal(transferAmount);
  });

  it("BUG: Message encoding includes both amount and shares, but receiver only reads shares position", async function () {
    const { client, systemWallet, chainSelector, router } = await loadFixture(deployFixture);

    // Deploy contracts
    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    const sourceChainReceiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;
    const destinationChainReceiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;

    // Deploy auto fee tokens with different multipliers
    const tokenFactory = await hre.ethers.getContractFactory('ERC20AutoFeeMock');
    const sourceToken = await tokenFactory.deploy("Source Token", "SRC");
    const destinationToken = await tokenFactory.deploy("Dest Token", "DST");

    const tokenId = 999n;
    const transferAmount = hre.ethers.parseEther("100"); // 100 tokens

    // Setup multipliers
    const sourceMultiplier = hre.ethers.parseEther("1.5");
    const destMultiplier = hre.ethers.parseEther("2.0");

    await sourceToken.updateMultiplierWithNonce(sourceMultiplier, 1);
    await destinationToken.updateMultiplierWithNonce(destMultiplier, 2);

    // Setup configurations
    await sourceChainReceiver.registerDestinationChain(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(await destinationChainReceiver.getAddress(), 32),
      EVM_CHAIN_VARIANT,
      200_000n
    );
    await sourceChainReceiver.registerToken(await sourceToken.getAddress(), tokenId);
    await destinationChainReceiver.registerSourceChain(
      chainSelector,
      hre.ethers.zeroPadValue(await sourceChainReceiver.getAddress(), 32)
    );
    await destinationChainReceiver.registerToken(await destinationToken.getAddress(), tokenId);

    // Setup balances
    await sourceToken.mint(client, hre.ethers.parseEther("1000"));
    await sourceToken.connect(client).approve(await sourceChainReceiver.getAddress(), transferAmount);
    await destinationToken.mint(systemWallet, hre.ethers.parseEther("1000"));
    await destinationToken.connect(systemWallet).approve(await destinationChainReceiver.getAddress(), hre.ethers.parseEther("1000"));

    // Expected calculation:
    // Source: 100 tokens with multiplier 1.5 => (100 * 1e18) / 1.5e18 = 66.666... shares (66666666666666666666)
    const expectedShares = (transferAmount * hre.ethers.WeiPerEther) / sourceMultiplier;

    // Destination: 66.666... shares with multiplier 2.0 => (66.666... * 2.0e18) / 1e18 = 133.333... tokens
    const expectedDestAmount = (expectedShares * destMultiplier) / hre.ethers.WeiPerEther;

    // Verify shares calculation
    const calculatedShares = await sourceToken.getSharesByUnderlyingAmount(transferAmount);
    expect(calculatedShares).to.equal(expectedShares);

    // Send tokens using the contract's send function
    const feeCosts = await sourceChainReceiver.connect(client).getDeliveryFeeCost(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(client.address, 32),
      await sourceToken.getAddress(),
      transferAmount,
      "0x"
    );

    await sourceChainReceiver.connect(client).send(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(client.address, 32),
      await sourceToken.getAddress(),
      transferAmount,
      "0x",
      { value: feeCosts }
    );

    // THE BUG: Contract encodes: [receiver(32), tokenId(8), amount(32), shares(32)]
    // But receiver reads bytes 40-72 as shares, which is actually the AMOUNT position!
    // So receiver will use transferAmount (100 tokens) as shares instead of expectedShares (66.666... shares)

    // Simulate CCIP processing - contract sends BOTH amount and shares but receiver reads amount position as shares
    const router_signer = await hre.ethers.getImpersonatedSigner(router);
    await client.sendTransaction({ to: router, value: hre.ethers.parseEther("1") });

    // This is what the buggy contract actually sends:
    const buggyMessage = {
      messageId: "0x93a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
      sourceChainSelector: chainSelector,
      sender: hre.ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [hre.ethers.zeroPadValue(await sourceChainReceiver.getAddress(), 32)]),
      data: hre.ethers.solidityPacked(
        ["bytes32", "uint64", "uint256", "uint256"], // BUG: includes both amount and shares
        [hre.ethers.zeroPadValue(client.address, 32), tokenId, transferAmount, expectedShares] // amount is at bytes 40-72
      ),
      destTokenAmounts: [],
    };

    await destinationChainReceiver.connect(router_signer).ccipReceive(buggyMessage);

    // Verify the BUG
    const clientDestBalance = await destinationToken.balanceOf(client.address);

    // BUG DOCUMENTATION TEST: This test documents the critical encoding bug in BackedCCIPReceiver.sol line 356.
    // Contract sends abi.encodePacked(_tokenReceiver, tokenId, _amount, _sharesAmount), but receiver reads bytes 40-72 expecting sharesAmount (gets _amount instead).
    expect(clientDestBalance).to.equal(expectedDestAmount,
      "BUG: Receiver is reading amount as shares! Should transfer shares * dest_multiplier, but transfers amount * dest_multiplier instead");
  });

  it("Should complete e2e transfer with different multipliers (2.2 and 3.8)", async function () {
    const { client, systemWallet, chainSelector, router } = await loadFixture(deployFixture);

    // Deploy contracts
    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    const sourceChainReceiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;
    const destinationChainReceiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;

    // Deploy auto fee tokens with different multipliers
    const tokenFactory = await hre.ethers.getContractFactory('ERC20AutoFeeMock');
    const sourceToken = await tokenFactory.deploy("Source Token", "SRC");
    const destinationToken = await tokenFactory.deploy("Dest Token", "DST");

    const tokenId = 888n;
    // Use 2200 tokens for clean division: 2200 / 2.2 = 1000 shares, 1000 * 3.8 = 3800 tokens
    const transferAmount = hre.ethers.parseEther("2200"); // 2200 tokens

    // Setup different multipliers: source = 2.2, destination = 3.8
    const sourceMultiplier = hre.ethers.parseEther("2.2");
    const destMultiplier = hre.ethers.parseEther("3.8");

    await sourceToken.updateMultiplierWithNonce(sourceMultiplier, 1);
    await destinationToken.updateMultiplierWithNonce(destMultiplier, 2);

    // Setup configurations
    await sourceChainReceiver.registerDestinationChain(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(await destinationChainReceiver.getAddress(), 32),
      EVM_CHAIN_VARIANT,
      200_000n
    );
    await sourceChainReceiver.registerToken(await sourceToken.getAddress(), tokenId);
    await destinationChainReceiver.registerSourceChain(
      chainSelector,
      hre.ethers.zeroPadValue(await sourceChainReceiver.getAddress(), 32)
    );
    await destinationChainReceiver.registerToken(await destinationToken.getAddress(), tokenId);

    // Setup balances
    await sourceToken.mint(client, hre.ethers.parseEther("100000")); // 100k tokens
    await sourceToken.connect(client).approve(await sourceChainReceiver.getAddress(), transferAmount);
    await destinationToken.mint(systemWallet, hre.ethers.parseEther("100000")); // 100k tokens
    await destinationToken.connect(systemWallet).approve(await destinationChainReceiver.getAddress(), hre.ethers.parseEther("100000"));

    // Calculate expected shares and destination amount (clean division)
    // shares = (2200e18 * 1e18) / 2.2e18 = 1000e18 (exact)
    const expectedShares = hre.ethers.parseEther("1000");
    // destAmount = (1000e18 * 3.8e18) / 1e18 = 3800e18 (exact)
    const expectedDestAmount = hre.ethers.parseEther("3800");

    // Verify shares calculation
    const calculatedShares = await sourceToken.getSharesByUnderlyingAmount(transferAmount);
    expect(calculatedShares).to.equal(expectedShares);

    // Send tokens
    const feeCosts = await sourceChainReceiver.connect(client).getDeliveryFeeCost(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(client.address, 32),
      await sourceToken.getAddress(),
      transferAmount,
      "0x"
    );

    await sourceChainReceiver.connect(client).send(
      chainSelector + 1n,
      hre.ethers.zeroPadValue(client.address, 32),
      await sourceToken.getAddress(),
      transferAmount,
      "0x",
      { value: feeCosts }
    );

    // Simulate CCIP processing with shares-based message
    const router_signer = await hre.ethers.getImpersonatedSigner(router);
    await client.sendTransaction({ to: router, value: hre.ethers.parseEther("1") });

    const ccipMessage = {
      messageId: "0x92a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
      sourceChainSelector: chainSelector,
      sender: hre.ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [hre.ethers.zeroPadValue(await sourceChainReceiver.getAddress(), 32)]),
      data: hre.ethers.solidityPacked(
        ["bytes32", "uint64", "uint256"],
        [hre.ethers.zeroPadValue(client.address, 32), tokenId, expectedShares]
      ),
      destTokenAmounts: [],
    };

    await destinationChainReceiver.connect(router_signer).ccipReceive(ccipMessage);

    // Verify transfer with different multipliers
    const sourceCustodyBalance = await sourceToken.balanceOf(systemWallet.address);
    const destCustodyBalance = await destinationToken.balanceOf(systemWallet.address);
    const clientDestBalance = await destinationToken.balanceOf(client.address);

    // FAILING: Contract bug at line 356 causes receiver to read _amount (2200) as shares instead of _sharesAmount (1000).
    // This results in incorrect transfer: 2200 shares * 3.8 multiplier = 8360 tokens instead of expected 1000 shares * 3.8 = 3800 tokens.
    expect(sourceCustodyBalance).to.equal(transferAmount);
    expect(clientDestBalance).to.equal(expectedDestAmount);
    expect(destCustodyBalance).to.equal(hre.ethers.parseEther("100000") - expectedDestAmount);
  });


  it("Should handle chain variant configurations", async function () {
    const { client, systemWallet, chainSelector, router } = await loadFixture(deployFixture);

    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    const receiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;

    // Register multiple chains with different variants and gas limits
    const evmChain = chainSelector + 1n;
    const svmChain = chainSelector + 2n;

    await receiver.registerDestinationChain(
      evmChain,
      hre.ethers.zeroPadValue("0x1111111111111111111111111111111111111111", 32),
      EVM_CHAIN_VARIANT,
      200_000n
    );

    await receiver.registerDestinationChain(
      svmChain,
      hre.ethers.zeroPadValue("0x2222222222222222222222222222222222222222", 32),
      1n, // SVM_CHAIN_VARIANT
      400_000n
    );

    // Verify configurations
    const evmChainInfo = await receiver.chainInfos(evmChain);
    const svmChainInfo = await receiver.chainInfos(svmChain);

    expect(evmChainInfo.variant).to.equal(EVM_CHAIN_VARIANT);
    expect(evmChainInfo.defaultGasLimit).to.equal(200_000n);
    expect(svmChainInfo.variant).to.equal(1n); // SVM_CHAIN_VARIANT
    expect(svmChainInfo.defaultGasLimit).to.equal(400_000n);
  });

  it("Should handle error recovery scenarios", async function () {
    const { client, systemWallet, chainSelector, router } = await loadFixture(deployFixture);

    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    const receiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;

    // Test configuration and then removal
    const testChain = chainSelector + 1n;
    const receiverAddress = hre.ethers.zeroPadValue("0x1111111111111111111111111111111111111111", 32);

    await receiver.registerDestinationChain(testChain, receiverAddress, EVM_CHAIN_VARIANT, 200_000n);
    expect(await receiver.allowlistedDestinationChains(testChain)).to.equal(receiverAddress);

    // Remove and verify
    await receiver.removeDestinationChain(testChain);
    expect(await receiver.allowlistedDestinationChains(testChain)).to.equal(hre.ethers.ZeroHash);

    // Re-register with different parameters
    const newReceiverAddress = hre.ethers.zeroPadValue("0x3333333333333333333333333333333333333333", 32);
    await receiver.registerDestinationChain(testChain, newReceiverAddress, EVM_CHAIN_VARIANT, 300_000n);

    const chainInfo = await receiver.chainInfos(testChain);
    expect(chainInfo.defaultGasLimit).to.equal(300_000n);
    expect(await receiver.allowlistedDestinationChains(testChain)).to.equal(newReceiverAddress);
  });

  it("Should handle upgrade simulation scenario", async function () {
    const { client, systemWallet, chainSelector, router } = await loadFixture(deployFixture);

    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    let receiver = await hre.upgrades.deployProxy(factory, [router, systemWallet.address]) as unknown as BackedCCIPReceiver;

    // Setup initial configuration
    const tokenFactory = await hre.ethers.getContractFactory('ERC20AutoFeeMock');
    const token = await tokenFactory.deploy("Test Token", "TEST");

    await receiver.registerToken(await token.getAddress(), 1337n);
    await receiver.registerDestinationChain(
      chainSelector + 1n,
      hre.ethers.zeroPadValue("0x1111111111111111111111111111111111111111", 32),
      EVM_CHAIN_VARIANT,
      200_000n
    );

    // Verify initial state
    const initialTokenInfo = await receiver.tokenInfos(await token.getAddress());
    const initialChainInfo = await receiver.chainInfos(chainSelector + 1n);

    // Simulate "upgrade" by creating new instance (in real scenario would use upgradeProxy)
    receiver = factory.attach(await receiver.getAddress()) as BackedCCIPReceiver;

    // Verify state persisted after "upgrade"
    const postUpgradeTokenInfo = await receiver.tokenInfos(await token.getAddress());
    const postUpgradeChainInfo = await receiver.chainInfos(chainSelector + 1n);

    expect(postUpgradeTokenInfo).to.equal(initialTokenInfo);
    expect(postUpgradeChainInfo.variant).to.equal(initialChainInfo.variant);
    expect(postUpgradeChainInfo.defaultGasLimit).to.equal(initialChainInfo.defaultGasLimit);
  });
});
