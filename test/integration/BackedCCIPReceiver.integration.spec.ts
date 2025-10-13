import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import {
  BackedCCIPReceiver,
} from "../../typechain-types";

const EVM_CHAIN_VARIANT = 0n;

// Helper function to check values are within tolerance (0.0001% or 1 part per million)
function expectWithinTolerance(actual: bigint, expected: bigint, message?: string) {
  const tolerance = expected / 1_000_000n; // 0.0001%
  const diff = actual > expected ? actual - expected : expected - actual;
  expect(diff).to.be.lte(tolerance, message || `Expected ${actual} to be within 0.0001% of ${expected}`);
}

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

    // Get shares amount for the transfer (1:1 for default multiplier)
    const sharesAmount = await sourceToken.getSharesByUnderlyingAmount(transferAmount);

    // Verify transfer completed with exact amounts (CCIP simulator automatically relays messages)
    const sourceCustodyBalance = await sourceToken.balanceOf(systemWallet.address);
    const destCustodyBalance = await destinationToken.balanceOf(systemWallet.address);
    const clientDestBalance = await destinationToken.balanceOf(client.address);

    // With multiplier 1.0 on both chains, amounts should match exactly
    expect(sourceCustodyBalance).to.equal(transferAmount); // Source custody received exact transfer amount
    expect(clientDestBalance).to.equal(transferAmount); // Client received exact transfer amount on destination
    expect(destCustodyBalance).to.equal(10_000_000_000_000_000_000n - transferAmount); // Destination custody has remaining balance

    // Verify shares are preserved (1:1 with multiplier 1.0)
    expect(sharesAmount).to.equal(transferAmount);
  });

  it("Should verify shares encoding with fractional multipliers", async function () {
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

    // Verify correct shares encoding with fractional multipliers (CCIP simulator automatically relays)
    const clientDestBalance = await destinationToken.balanceOf(client.address);

    // Contract correctly encodes shares, preserving economic value across chains with different multipliers
    expect(clientDestBalance).to.equal(expectedDestAmount);
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

    // Verify transfer with different multipliers
    const sourceCustodyBalance = await sourceToken.balanceOf(systemWallet.address);
    const destCustodyBalance = await destinationToken.balanceOf(systemWallet.address);
    const clientDestBalance = await destinationToken.balanceOf(client.address);

    // Verify economic value preservation through shares (allow for rounding errors)
    expect(sourceCustodyBalance).to.equal(transferAmount);
    expect(clientDestBalance).to.equal(expectedDestAmount);
    expectWithinTolerance(destCustodyBalance, hre.ethers.parseEther("100000") - expectedDestAmount, "Custody balance should match within tolerance");
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
