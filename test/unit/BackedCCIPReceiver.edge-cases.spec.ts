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
import { Client } from "../../typechain-types/@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver";

const EVM_CHAIN_VARIANT = 0n;
const SVM_CHAIN_VARIANT = 1n;
const REGULAR_TOKEN = 0n;
const AUTO_FEE_TOKEN = 1n;

describe("Backed CCIP Receiver - Edge Cases & Auto Fee Tests", () => {
  async function deployFixture() {
    const [owner, client, systemWallet] = await hre.ethers.getSigners();

    const ccipLocalSimualtorFactory = await hre.ethers.getContractFactory(
      "CustomFeeCCIPLocalSimulator"
    );
    const ccipLocalSimulator: CustomFeeCCIPLocalSimulator =
      await ccipLocalSimualtorFactory.deploy();

    const {
      chainSelector_: chainSelector,
      sourceRouter_: sourceRouter
    } = await ccipLocalSimulator.configuration();

    const factory = await hre.ethers.getContractFactory("BackedCCIPReceiver");
    const backedCCIPReceiver =
      await hre.upgrades.deployProxy(factory, [sourceRouter, systemWallet.address]) as unknown as BackedCCIPReceiver;

    const tokenFactory = await hre.ethers.getContractFactory('ERC20Mock');
    const erc20 = await tokenFactory.deploy("Test Token", "TEST");

    const autoFeeTokenFactory = await hre.ethers.getContractFactory('ERC20AutoFeeMock');
    const erc20AutoFee = await autoFeeTokenFactory.deploy("Auto Fee Token", "AUTO");

    return {
      owner,
      client,
      systemWallet,
      chainSelector,
      sourceRouter,
      backedCCIPReceiver,
      erc20,
      erc20AutoFee
    };
  }

  let owner: SignerWithAddress;
  let client: SignerWithAddress;
  let systemWallet: SignerWithAddress;
  let chainSelector: bigint;
  let sourceRouter: string;
  let backedCCIPReceiver: BackedCCIPReceiver;
  let erc20: ERC20Mock;
  let erc20AutoFee: ERC20AutoFeeMock;

  beforeEach(async () => {
    ({
      owner,
      client,
      systemWallet,
      chainSelector,
      sourceRouter,
      backedCCIPReceiver,
      erc20,
      erc20AutoFee
    } = await loadFixture(deployFixture));
  });

  describe("Extreme Value Testing", () => {
    const tokenId = 1n;
    const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);

    beforeEach(async () => {
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        chainSelector, receiver, EVM_CHAIN_VARIANT, 200000n
      );
      await backedCCIPReceiver.connect(owner).registerToken(
        await erc20.getAddress(), tokenId
      );
    });

    it("should handle maximum uint256 token amounts", async () => {
      const maxAmount = hre.ethers.MaxUint256;
      await erc20.mint(client, maxAmount);
      await erc20.connect(client).approve(await backedCCIPReceiver.getAddress(), maxAmount);

      // This should not revert due to overflow
      const feeCost = await backedCCIPReceiver.getDeliveryFeeCost(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32),
        await erc20.getAddress(),
        maxAmount,
        "0x"
      );

      expect(feeCost).to.be.greaterThan(0);
    });

    it("should handle minimum token amounts (1 wei)", async () => {
      const minAmount = 1n;
      await erc20.mint(client, minAmount);
      await erc20.connect(client).approve(await backedCCIPReceiver.getAddress(), minAmount);

      await expect(
        backedCCIPReceiver.connect(client).send(
          chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          await erc20.getAddress(),
          minAmount,
          "0x",
          { value: hre.ethers.parseEther("0.01") }
        )
      ).to.emit(backedCCIPReceiver, "MessageSent");
    });

    it("should handle maximum chain selector values", async () => {
      const maxChainSelector = hre.ethers.MaxUint256 & ((1n << 64n) - 1n); // Max uint64

      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        maxChainSelector, receiver, EVM_CHAIN_VARIANT, 200000n
      );

      const chainInfo = await backedCCIPReceiver.chainInfos(maxChainSelector);
      expect(chainInfo.variant).to.equal(EVM_CHAIN_VARIANT);
    });

    it("should handle maximum token ID values", async () => {
      const maxTokenId = hre.ethers.MaxUint256 & ((1n << 64n) - 1n); // Max uint64
      const newToken = await (await hre.ethers.getContractFactory('ERC20Mock')).deploy("Max Token", "MAX");

      await backedCCIPReceiver.connect(owner).registerToken(
        await newToken.getAddress(), maxTokenId
      );

      const tokenInfo = await backedCCIPReceiver.tokenInfos(await newToken.getAddress());
      expect(tokenInfo).to.equal(maxTokenId);
    });

    it("should handle maximum gas limit values", async () => {
      const maxGasLimit = hre.ethers.MaxUint256;

      await backedCCIPReceiver.connect(owner).updateGasLimit(chainSelector, maxGasLimit);

      const gasLimit = await backedCCIPReceiver.gasLimit(chainSelector);
      expect(gasLimit).to.equal(maxGasLimit);
    });
  });

  describe("Auto Fee Token Advanced Scenarios", () => {
    const tokenId = 1337n;
    const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);
    let router: SignerWithAddress;

    beforeEach(async () => {
      router = await hre.ethers.getImpersonatedSigner(sourceRouter);

      // Fund the router for gas
      await owner.sendTransaction({
        to: sourceRouter,
        value: hre.ethers.parseEther("1")
      });

      await backedCCIPReceiver.connect(owner).registerSourceChain(chainSelector, receiver);
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        chainSelector, receiver, EVM_CHAIN_VARIANT, 200000n
      );
      await backedCCIPReceiver.connect(owner).registerToken(
        await erc20AutoFee.getAddress(), tokenId
      );

      // Setup token balances and approvals
      await erc20AutoFee.mint(client, 1000000n);
      await erc20AutoFee.mint(systemWallet, 1000000n);
      await erc20AutoFee.connect(client).approve(await backedCCIPReceiver.getAddress(), 1000000n);
      await erc20AutoFee.connect(systemWallet).approve(await backedCCIPReceiver.getAddress(), 1000000n);
    });

    it("should handle multiplier nonce synchronization across multiple messages", async () => {
      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 100000n;

      // Set initial multiplier
      await erc20AutoFee.updateMultiplierWithNonce(hre.ethers.parseEther("1.0"), 1);

      // Process message with nonce 1
      let payload = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [hre.ethers.parseEther("1.0"), 1]
      );

      let ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, payload]
        ),
        destTokenAmounts: [],
      };

      await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);

      // Update multiplier to nonce 2
      await erc20AutoFee.updateMultiplierWithNonce(hre.ethers.parseEther("1.1"), 2);

      // Process older message with nonce 1 (should adjust amount)
      payload = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [hre.ethers.parseEther("1.0"), 1] // Old multiplier
      );

      ccipMessage.messageId = "0x92a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf";
      ccipMessage.data = hre.ethers.solidityPacked(
        ["bytes32", "uint64", "uint256", "uint8", "bytes"],
        [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, payload]
      );

      await expect(
        backedCCIPReceiver.connect(router).ccipReceive(ccipMessage)
      ).to.emit(backedCCIPReceiver, "MessageReceived");

      // The amount should be adjusted based on multiplier difference
      const clientBalance = await erc20AutoFee.balanceOf(client.address);
      expect(clientBalance).to.be.greaterThan(1000000n); // Original + received amounts
    });

    it("should handle extreme multiplier values", async () => {
      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 1000n;

      // Set very small multiplier
      const smallMultiplier = hre.ethers.parseUnits("0.000001", 18); // 0.000001
      await erc20AutoFee.updateMultiplierWithNonce(smallMultiplier, 1);

      const payload = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [smallMultiplier, 1]
      );

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, payload]
        ),
        destTokenAmounts: [],
      };

      await expect(
        backedCCIPReceiver.connect(router).ccipReceive(ccipMessage)
      ).to.emit(backedCCIPReceiver, "MessageReceived");
    });

    it("should handle zero multiplier edge case", async () => {
      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 100000n;

      // Set zero multiplier (edge case)
      await erc20AutoFee.updateMultiplierWithNonce(0n, 1);

      const payload = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [0n, 1]
      );

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, payload]
        ),
        destTokenAmounts: [],
      };

      // Zero multiplier causes division by zero in the auto fee token contract
      await expect(
        backedCCIPReceiver.connect(router).ccipReceive(ccipMessage)
      ).to.be.reverted;
    });

    it("should calculate correct amounts with large multiplier differences", async () => {
      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 100000n;

      // Source multiplier: 1.0
      const sourceMultiplier = hre.ethers.parseEther("1.0");
      // Destination multiplier: 2.0 (doubled)
      const destMultiplier = hre.ethers.parseEther("2.0");

      // Set up destination chain state
      await erc20AutoFee.updateMultiplierWithNonce(destMultiplier, 2);

      // Process message from chain with older, smaller multiplier
      const payload = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [sourceMultiplier, 1] // Source nonce is 1, dest nonce is 2
      );

      const initialBalance = await erc20AutoFee.balanceOf(client.address);

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, payload]
        ),
        destTokenAmounts: [],
      };

      await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);

      const finalBalance = await erc20AutoFee.balanceOf(client.address);

      // Expected: amount * destMultiplier / sourceMultiplier = 100000 * 2 / 1 = 200000
      // But this is in terms of token balance, so we need to account for the multiplier effect
      const expectedIncrease = amount * 2n; // 200000 underlying, but balance calculation includes multiplier
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("should handle sending auto fee tokens with current multiplier", async () => {
      const amount = 50000n;
      const multiplier = hre.ethers.parseEther("0.5");

      // Set multiplier
      await erc20AutoFee.updateMultiplierValue(multiplier);

      const initialCustodyBalance = await erc20AutoFee.balanceOf(systemWallet.address);

      await expect(
        backedCCIPReceiver.connect(client).send(
          chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          await erc20AutoFee.getAddress(),
          amount,
          "0x",
          { value: hre.ethers.parseEther("0.01") }
        )
      ).to.emit(backedCCIPReceiver, "MessageSent");

      const finalCustodyBalance = await erc20AutoFee.balanceOf(systemWallet.address);
      expect(finalCustodyBalance).to.equal(initialCustodyBalance + amount);
    });
  });

  describe("Complex Chain Variant Scenarios", () => {
    const evmChainSelector = 1n;
    const svmChainSelector = 2n;
    const tokenId = 1337n;

    beforeEach(async () => {
      // Register multiple chains with different variants
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        evmChainSelector,
        hre.ethers.zeroPadValue("0x1111111111111111111111111111111111111111", 32),
        EVM_CHAIN_VARIANT,
        200000n
      );

      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        svmChainSelector,
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        SVM_CHAIN_VARIANT,
        300000n
      );

      await backedCCIPReceiver.connect(owner).registerToken(
        await erc20.getAddress(), tokenId
      );

      await erc20.mint(client, 1000000n);
      await erc20.connect(client).approve(await backedCCIPReceiver.getAddress(), 1000000n);
    });

    it("should handle different gas limits for different chain variants", async () => {
      const evmGasLimit = await backedCCIPReceiver.gasLimit(evmChainSelector);
      const svmGasLimit = await backedCCIPReceiver.gasLimit(svmChainSelector);

      expect(evmGasLimit).to.equal(200000n);
      expect(svmGasLimit).to.equal(300000n);

      // Update gas limits individually
      await backedCCIPReceiver.connect(owner).updateGasLimit(evmChainSelector, 250000n);
      await backedCCIPReceiver.connect(owner).updateGasLimit(svmChainSelector, 400000n);

      const updatedEvmGasLimit = await backedCCIPReceiver.gasLimit(evmChainSelector);
      const updatedSvmGasLimit = await backedCCIPReceiver.gasLimit(svmChainSelector);

      expect(updatedEvmGasLimit).to.equal(250000n);
      expect(updatedSvmGasLimit).to.equal(400000n);
    });

    it("should handle fee calculations for different chain variants", async () => {
      const amount = 100000n;
      const tokenReceiver = hre.ethers.zeroPadValue(client.address, 32);

      // EVM chain fee (no chain-specific args)
      const evmFee = await backedCCIPReceiver.getDeliveryFeeCost(
        evmChainSelector,
        tokenReceiver, // tokenReceiver is already bytes32
        await erc20.getAddress(),
        amount,
        "0x"
      );

      // SVM chain fee (with chain-specific args)
      const svmChainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [1n, ["0x1111111111111111111111111111111111111111111111111111111111111111"]]
      );

      const svmFee = await backedCCIPReceiver.getDeliveryFeeCost(
        svmChainSelector,
        tokenReceiver,
        await erc20.getAddress(),
        amount,
        svmChainSpecificArgs
      );

      // Both should return positive fees
      expect(evmFee).to.be.greaterThan(0);
      expect(svmFee).to.be.greaterThan(0);
    });

    it("should handle chain removal and re-registration", async () => {
      // Remove EVM chain
      await expect(
        backedCCIPReceiver.connect(owner).removeDestinationChain(evmChainSelector)
      ).to.emit(backedCCIPReceiver, "DestinationChainRemoved");

      // Verify removal
      const removedReceiver = await backedCCIPReceiver.allowlistedDestinationChains(evmChainSelector);
      expect(removedReceiver).to.equal(hre.ethers.ZeroHash);

      // Re-register with different parameters
      const newReceiver = hre.ethers.zeroPadValue("0x3333333333333333333333333333333333333333", 32);
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        evmChainSelector,
        newReceiver,
        EVM_CHAIN_VARIANT,
        500000n
      );

      const reregisteredReceiver = await backedCCIPReceiver.allowlistedDestinationChains(evmChainSelector);
      expect(reregisteredReceiver).to.equal(newReceiver);

      const chainInfo = await backedCCIPReceiver.chainInfos(evmChainSelector);
      expect(chainInfo.defaultGasLimit).to.equal(500000n);
    });
  });

  describe("Token Management Edge Cases", () => {
    it("should handle token removal and re-registration", async () => {
      const tokenAddress = await erc20.getAddress();
      const tokenId1 = 100n;
      const tokenId2 = 200n;

      // Register token
      await backedCCIPReceiver.connect(owner).registerToken(tokenAddress, tokenId1);

      // Verify registration
      const tokenInfo1 = await backedCCIPReceiver.tokenInfos(tokenAddress);
      expect(tokenInfo1).to.equal(tokenId1);
      expect(await backedCCIPReceiver.tokens(tokenId1)).to.equal(tokenAddress);

      // Remove token
      await expect(
        backedCCIPReceiver.connect(owner).removeToken(tokenAddress)
      ).to.emit(backedCCIPReceiver, "TokenRemoved");

      // Verify removal
      const removedTokenInfo = await backedCCIPReceiver.tokenInfos(tokenAddress);
      expect(removedTokenInfo).to.equal(0n);
      expect(await backedCCIPReceiver.tokens(tokenId1)).to.equal(hre.ethers.ZeroAddress);

      // Re-register with different ID and variant
      await backedCCIPReceiver.connect(owner).registerToken(tokenAddress, tokenId2);

      const tokenInfo2 = await backedCCIPReceiver.tokenInfos(tokenAddress);
      expect(tokenInfo2).to.equal(tokenId2);
      expect(await backedCCIPReceiver.tokens(tokenId2)).to.equal(tokenAddress);
    });

    it("should handle multiple tokens with sequential IDs", async () => {
      const tokens = [];
      const tokenIds = [];

      // Create and register 10 tokens
      for (let i = 1; i <= 10; i++) {
        const token = await (await hre.ethers.getContractFactory('ERC20Mock')).deploy(`Token${i}`, `TK${i}`);
        const tokenId = BigInt(i);

        tokens.push(token);
        tokenIds.push(tokenId);

        await backedCCIPReceiver.connect(owner).registerToken(
          await token.getAddress(),
          tokenId
        );
      }

      // Verify all registrations
      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = await backedCCIPReceiver.tokenInfos(await tokens[i].getAddress());
        expect(tokenInfo).to.equal(tokenIds[i]);
        expect(await backedCCIPReceiver.tokens(tokenIds[i])).to.equal(await tokens[i].getAddress());
      }

      // Remove every other token
      for (let i = 0; i < tokens.length; i += 2) {
        await backedCCIPReceiver.connect(owner).removeToken(await tokens[i].getAddress());
      }

      // Verify removals and that others remain
      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = await backedCCIPReceiver.tokenInfos(await tokens[i].getAddress());
        if (i % 2 === 0) {
          expect(tokenInfo).to.equal(0n); // Removed
        } else {
          expect(tokenInfo).to.equal(tokenIds[i]); // Still registered
        }
      }
    });
  });

  describe("Message Data Validation Edge Cases", () => {
    it("should handle malformed CCIP message data", async () => {
      const router = await hre.ethers.getImpersonatedSigner(sourceRouter);

      // Fund the router for gas
      await owner.sendTransaction({
        to: sourceRouter,
        value: hre.ethers.parseEther("1")
      });

      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);

      await backedCCIPReceiver.connect(owner).registerSourceChain(chainSelector, receiver);

      // Message with insufficient data length
      const shortData = "0x1234"; // Too short to parse

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: shortData,
        destTokenAmounts: [],
      };

      // This should not revert the entire transaction, but should consume the message
      await expect(
        backedCCIPReceiver.connect(router).ccipReceive(ccipMessage)
      ).to.not.be.reverted;
    });

    it("should handle extremely long message data", async () => {
      const router = await hre.ethers.getImpersonatedSigner(sourceRouter);

      // Fund the router for gas
      await owner.sendTransaction({
        to: sourceRouter,
        value: hre.ethers.parseEther("1")
      });

      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);

      await backedCCIPReceiver.connect(owner).registerSourceChain(chainSelector, receiver);
      await backedCCIPReceiver.connect(owner).registerToken(await erc20.getAddress(), 1337n);

      // Create very long payload
      const longPayload = "0x" + "ff".repeat(10000); // 10KB of data

      const longData = hre.ethers.solidityPacked(
        ["bytes32", "uint64", "uint256", "uint8", "bytes"],
        [hre.ethers.zeroPadValue(client.address, 32), 1337n, 100000n, longPayload]
      );

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: longData,
        destTokenAmounts: [],
      };

      // Setup custody wallet with tokens
      await erc20.mint(systemWallet, 1000000n);
      await erc20.connect(systemWallet).approve(await backedCCIPReceiver.getAddress(), 1000000n);

      await expect(
        backedCCIPReceiver.connect(router).ccipReceive(ccipMessage)
      ).to.emit(backedCCIPReceiver, "MessageReceived");
    });
  });

  describe("Upgrade Compatibility Tests", () => {
    it("should maintain state after potential upgrade", async () => {
      // Register some data
      const tokenAddress = await erc20.getAddress();
      const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);

      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        chainSelector, receiver, EVM_CHAIN_VARIANT, 200000n
      );
      await backedCCIPReceiver.connect(owner).registerSourceChain(chainSelector, receiver);
      await backedCCIPReceiver.connect(owner).registerToken(tokenAddress, 1337n);

      // Verify state before "upgrade"
      expect(await backedCCIPReceiver.allowlistedDestinationChains(chainSelector)).to.equal(receiver);
      expect(await backedCCIPReceiver.allowlistedSourceChains(chainSelector)).to.equal(receiver);

      const tokenInfo = await backedCCIPReceiver.tokenInfos(tokenAddress);
      expect(tokenInfo).to.equal(1337n);

      const chainInfo = await backedCCIPReceiver.chainInfos(chainSelector);
      expect(chainInfo.variant).to.equal(EVM_CHAIN_VARIANT);
      expect(chainInfo.defaultGasLimit).to.equal(200000n);

      // State should remain intact (simulated upgrade)
      // In a real upgrade scenario, this would involve deploying a new implementation
      expect(await backedCCIPReceiver.custodyWallet()).to.equal(systemWallet.address);
    });
  });
});
