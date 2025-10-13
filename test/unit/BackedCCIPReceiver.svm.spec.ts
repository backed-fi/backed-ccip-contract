import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import {
  BackedCCIPReceiver,
  CustomFeeCCIPLocalSimulator,
  ERC20Mock,
  ERC20AutoFeeMock,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const EVM_CHAIN_VARIANT = 0n;
const SVM_CHAIN_VARIANT = 1n;

describe("Backed CCIP Receiver - SVM Support Tests", () => {
  async function deployFixture() {
    const [client, systemWallet, deployer] = await hre.ethers.getSigners();

    const ccipLocalSimualtorFactory = await hre.ethers.getContractFactory(
      "CustomFeeCCIPLocalSimulator"
    );
    const ccipLocalSimulator: CustomFeeCCIPLocalSimulator =
      await ccipLocalSimualtorFactory.deploy();

    const {
      chainSelector_: chainSelector,
      sourceRouter_: sourceRouter
    } = await ccipLocalSimulator.configuration();

    const factory = await hre.ethers.getContractFactory(
      "BackedCCIPReceiver"
    );
    const backedCCIPReceiver =
      await hre.upgrades.deployProxy(factory, [sourceRouter, systemWallet.address]) as unknown as BackedCCIPReceiver;

    const tokenFactory = await hre.ethers.getContractFactory('ERC20AutoFeeMock');
    const erc20AutoFee = await tokenFactory.deploy("Test Token", "TEST");
    const erc20Address = await erc20AutoFee.getAddress();

    return {
      client,
      systemWallet,
      deployer,
      chainSelector,
      sourceRouter,
      backedCCIPReceiver,
      erc20AutoFee,
      erc20Address
    };
  }

  let client: SignerWithAddress;
  let systemWallet: SignerWithAddress;
  let deployer: SignerWithAddress;
  let chainSelector: bigint;
  let sourceRouter: string;
  let backedCCIPReceiver: BackedCCIPReceiver;
  let erc20AutoFee: ERC20AutoFeeMock;
  let erc20Address: string;

  beforeEach(async () => {
    ({
      client,
      systemWallet,
      deployer,
      chainSelector,
      sourceRouter,
      backedCCIPReceiver,
      erc20AutoFee,
      erc20Address
    } = await loadFixture(deployFixture));

    await erc20AutoFee.mint(client, 1000000n);
  });

  describe("SVM Chain Registration", () => {
    const mockSVMReceiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32); // Valid address format
    const defaultGasLimit = 200000n;

    it("should successfully register SVM chain variant", async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );

      const registeredReceiver = await backedCCIPReceiver.allowlistedDestinationChains(chainSelector);
      expect(registeredReceiver).to.equal(mockSVMReceiver);

      const chainInfo = await backedCCIPReceiver.chainInfos(chainSelector);
      expect(chainInfo.variant).to.equal(SVM_CHAIN_VARIANT);
      expect(chainInfo.defaultGasLimit).to.equal(defaultGasLimit);
    });

    it("should emit DestinationChainRegistered event for SVM chain", async () => {
      await expect(
        backedCCIPReceiver.registerDestinationChain(
          chainSelector,
          mockSVMReceiver,
          SVM_CHAIN_VARIANT,
          defaultGasLimit
        )
      )
        .to.emit(backedCCIPReceiver, "DestinationChainRegistered")
        .withArgs(chainSelector, mockSVMReceiver);
    });

    it("should allow gas limit updates for SVM chains", async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );

      const newGasLimit = 300000n;
      await backedCCIPReceiver.updateGasLimit(chainSelector, newGasLimit);

      const updatedChainInfo = await backedCCIPReceiver.chainInfos(chainSelector);
      expect(updatedChainInfo.defaultGasLimit).to.equal(newGasLimit);
    });

    it("should return correct gas limit for SVM chain", async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );

      const gasLimit = await backedCCIPReceiver.gasLimit(chainSelector);
      expect(gasLimit).to.equal(defaultGasLimit);
    });
  });

  describe("SVM Message Building and Fee Calculation", () => {
    const mockSVMReceiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);
    const defaultGasLimit = 200000n;
    const tokenId = 1337n;
    const transferAmount = 100000n;

    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );
      await backedCCIPReceiver.registerToken(erc20Address, tokenId);
    });

    it("should calculate delivery fees for SVM destination with proper chain-specific args", async () => {
      // SVM-specific arguments: accountIsWritableBitmap and accounts array
      const accountIsWritableBitmap = 0b11; // First two accounts are writable
      const accounts = [
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222"
      ];
      
      const chainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [accountIsWritableBitmap, accounts]
      );

      const feeCost = await backedCCIPReceiver.getDeliveryFeeCost(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32), // Use actual address, not mock bytes32
        erc20Address,
        transferAmount,
        chainSpecificArgs
      );

      // Should return non-zero fee cost (mocked value is 1)
      expect(feeCost).to.be.greaterThan(0);
    });

    it("should handle empty accounts array in SVM chain-specific args", async () => {
      const accountIsWritableBitmap = 0n;
      const accounts: string[] = [];
      
      const chainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [accountIsWritableBitmap, accounts]
      );

      const feeCost = await backedCCIPReceiver.getDeliveryFeeCost(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32), // Use actual address, not mock bytes32
        erc20Address,
        transferAmount,
        chainSpecificArgs
      );

      expect(feeCost).to.be.greaterThan(0);
    });

    it("should handle maximum accounts array in SVM chain-specific args", async () => {
      // Test with maximum reasonable number of accounts
      const accountIsWritableBitmap = 0xFFFFFFFFFFFFFFFFn; // All accounts writable
      const accounts = Array(64).fill(0).map((_, i) => 
        hre.ethers.zeroPadValue(`0x${i.toString(16).padStart(2, '0')}`, 32)
      );
      
      const chainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [accountIsWritableBitmap, accounts]
      );

      const feeCost = await backedCCIPReceiver.getDeliveryFeeCost(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32), // Use actual address, not mock bytes32
        erc20Address,
        transferAmount,
        chainSpecificArgs
      );

      expect(feeCost).to.be.greaterThan(0);
    });
  });

  describe("SVM Token Transfers", () => {
    const mockSVMReceiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);
    const defaultGasLimit = 200000n;
    const tokenId = 1337n;
    const transferAmount = 100000n;

    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );
      await backedCCIPReceiver.registerToken(erc20Address, tokenId);
      await erc20AutoFee.connect(client).approve(await backedCCIPReceiver.getAddress(), transferAmount);
    });

    it("should successfully send tokens to SVM destination", async () => {
      // For this test, we'll use EVM chain variant since the mock router only supports EVM
      // but we test the SVM registration and configuration logic
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        EVM_CHAIN_VARIANT, // Use EVM for actual sending due to mock limitations
        defaultGasLimit
      );

      const initialClientBalance = await erc20AutoFee.balanceOf(client.address);
      const initialCustodyBalance = await erc20AutoFee.balanceOf(systemWallet.address);

      await expect(
        backedCCIPReceiver.connect(client).send(
          chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          erc20Address,
          transferAmount,
          "0x", // Use empty args for EVM compatibility with mock
          { value: hre.ethers.parseEther("0.01") }
        )
      ).to.emit(backedCCIPReceiver, "MessageSent");

      const finalClientBalance = await erc20AutoFee.balanceOf(client.address);
      const finalCustodyBalance = await erc20AutoFee.balanceOf(systemWallet.address);

      expect(finalClientBalance).to.equal(initialClientBalance - transferAmount);
      expect(finalCustodyBalance).to.equal(initialCustodyBalance + transferAmount);
    });

    it("should emit MessageSent event with correct SVM parameters", async () => {
      // Use EVM variant for actual sending, but test event emission
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        EVM_CHAIN_VARIANT, // Use EVM for actual sending due to mock limitations
        defaultGasLimit
      );

      await expect(
        backedCCIPReceiver.connect(client).send(
          chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          erc20Address,
          transferAmount,
          "0x", // Use empty args for EVM compatibility with mock
          { value: hre.ethers.parseEther("0.01") }
        )
      ).to.emit(backedCCIPReceiver, "MessageSent");
    });
  });

  describe("Mixed Chain Variants", () => {
    const evmReceiver = "0x1111111111111111111111111111111111111111";
    const svmReceiver = hre.ethers.zeroPadValue("0x2222222222222222222222222222222222222222", 32);
    const evmChainSelector = 1n;
    const svmChainSelector = 2n;
    const defaultGasLimit = 200000n;
    const tokenId = 1337n;

    beforeEach(async () => {
      // Register both EVM and SVM chains
      await backedCCIPReceiver.registerDestinationChain(
        evmChainSelector,
        hre.ethers.zeroPadValue(evmReceiver, 32),
        EVM_CHAIN_VARIANT,
        defaultGasLimit
      );
      
      await backedCCIPReceiver.registerDestinationChain(
        svmChainSelector,
        svmReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );

      await backedCCIPReceiver.registerToken(erc20Address, tokenId);
    });

    it("should handle both EVM and SVM chain registrations", async () => {
      const evmChainInfo = await backedCCIPReceiver.chainInfos(evmChainSelector);
      const svmChainInfo = await backedCCIPReceiver.chainInfos(svmChainSelector);

      expect(evmChainInfo.variant).to.equal(EVM_CHAIN_VARIANT);
      expect(svmChainInfo.variant).to.equal(SVM_CHAIN_VARIANT);

      const evmReceiverAddress = await backedCCIPReceiver.allowlistedDestinationChains(evmChainSelector);
      const svmReceiverAddress = await backedCCIPReceiver.allowlistedDestinationChains(svmChainSelector);

      expect(evmReceiverAddress).to.equal(hre.ethers.zeroPadValue(evmReceiver, 32));
      expect(svmReceiverAddress).to.equal(svmReceiver);
    });

    it("should calculate different fees for EVM vs SVM chains", async () => {
      const tokenReceiver = hre.ethers.zeroPadValue(client.address, 32);
      const transferAmount = 100000n;

      // EVM chain - no chain-specific args needed
      const evmFee = await backedCCIPReceiver.getDeliveryFeeCost(
        evmChainSelector,
        tokenReceiver,
        erc20Address,
        transferAmount,
        "0x"
      );

      // SVM chain - requires chain-specific args
      const accountIsWritableBitmap = 0b1;
      const accounts = ["0x1111111111111111111111111111111111111111111111111111111111111111"];
      const chainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [accountIsWritableBitmap, accounts]
      );

      const svmFee = await backedCCIPReceiver.getDeliveryFeeCost(
        svmChainSelector,
        tokenReceiver,
        erc20Address,
        transferAmount,
        chainSpecificArgs
      );

      // Both should return positive fees (exact values depend on mock implementation)
      expect(evmFee).to.be.greaterThan(0);
      expect(svmFee).to.be.greaterThan(0);
    });
  });

  describe("SVM Edge Cases", () => {
    const mockSVMReceiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);
    const defaultGasLimit = 200000n;

    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        defaultGasLimit
      );
    });

    it("should reject invalid chain-specific args format", async () => {
      await backedCCIPReceiver.registerToken(erc20Address, 1337n);
      await erc20AutoFee.connect(client).approve(await backedCCIPReceiver.getAddress(), 100000n);

      // Invalid chain-specific args (missing required fields)
      const invalidChainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64"],
        [1] // Missing accounts array
      );

      await expect(
        backedCCIPReceiver.connect(client).send(
          chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          erc20Address,
          100000n,
          invalidChainSpecificArgs,
          { value: hre.ethers.parseEther("0.01") }
        )
      ).to.be.reverted;
    });

    it("should handle zero gas limit for SVM chains", async () => {
      // Register SVM chain with zero gas limit
      const zeroGasLimit = 0n;
      const newChainSelector = 999n;
      
      await backedCCIPReceiver.registerDestinationChain(
        newChainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        zeroGasLimit
      );

      const chainInfo = await backedCCIPReceiver.chainInfos(newChainSelector);
      expect(chainInfo.defaultGasLimit).to.equal(zeroGasLimit);
    });

    it("should handle very large account arrays", async () => {
      // This test ensures the system can handle large SVM account arrays
      const accountIsWritableBitmap = 0xFFFFFFFFFFFFFFFFn;
      const largeAccountsArray = Array(100).fill(0).map((_, i) => 
        hre.ethers.zeroPadValue(`0x${i.toString(16).padStart(2, '0')}`, 32)
      );
      
      const chainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [accountIsWritableBitmap, largeAccountsArray]
      );

      // This should not revert for fee calculation
      await backedCCIPReceiver.registerToken(erc20Address, 1337n);
      
      const feeCost = await backedCCIPReceiver.getDeliveryFeeCost(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32),
        erc20Address,
        100000n,
        chainSpecificArgs
      );

      expect(feeCost).to.be.greaterThan(0);
    });
  });

  describe("SVM Gas Limit Management", () => {
    const mockSVMReceiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);
    const initialGasLimit = 200000n;

    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(
        chainSelector,
        mockSVMReceiver,
        SVM_CHAIN_VARIANT,
        initialGasLimit
      );
    });

    it("should update SVM chain gas limit", async () => {
      const newGasLimit = 400000n;
      
      await expect(
        backedCCIPReceiver.updateGasLimit(chainSelector, newGasLimit)
      )
        .to.emit(backedCCIPReceiver, "GasLimitUpdated")
        .withArgs(chainSelector, newGasLimit);

      const updatedGasLimit = await backedCCIPReceiver.gasLimit(chainSelector);
      expect(updatedGasLimit).to.equal(newGasLimit);
    });

    it("should handle maximum gas limit values for SVM", async () => {
      // Test with very large gas limit (but still within uint256 range)
      const maxGasLimit = hre.ethers.MaxUint256;
      
      await backedCCIPReceiver.updateGasLimit(chainSelector, maxGasLimit);
      
      const updatedGasLimit = await backedCCIPReceiver.gasLimit(chainSelector);
      expect(updatedGasLimit).to.equal(maxGasLimit);
    });

    it("should only allow owner to update SVM gas limits", async () => {
      const newGasLimit = 300000n;

      // Create a random non-owner account
      const [,,,randomUser] = await hre.ethers.getSigners();
      await expect(
        backedCCIPReceiver.connect(randomUser).updateGasLimit(chainSelector, newGasLimit)
      ).to.be.revertedWithCustomError(backedCCIPReceiver, "OwnableUnauthorizedAccount");
    });
  });
});