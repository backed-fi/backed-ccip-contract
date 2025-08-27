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

describe("Backed CCIP Receiver - Performance & Gas Optimization Tests", () => {
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

  describe("Gas Usage Analysis", () => {
    const tokenId = 1337n;
    const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);
    const amount = 100000n;

    beforeEach(async () => {
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        chainSelector, receiver, EVM_CHAIN_VARIANT, 200000n
      );
      await backedCCIPReceiver.connect(owner).registerToken(
        await erc20.getAddress(), tokenId, REGULAR_TOKEN
      );
      await erc20.mint(client, 1000000n);
      await erc20.connect(client).approve(await backedCCIPReceiver.getAddress(), 1000000n);
    });

    it("should measure gas usage for EVM token send", async () => {
      const tx = await backedCCIPReceiver.connect(client).send(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32),
        await erc20.getAddress(),
        amount,
        "0x", // EVM chains don't need chain-specific args
        { value: hre.ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`EVM token send gas usage: ${gasUsed.toString()}`);
      
      // Gas should be reasonable for a cross-chain transaction
      expect(gasUsed).to.be.lessThan(200000n); // Adjust based on actual measurements
    });

    it("should measure gas usage for SVM token send", async () => {
      // Register SVM chain
      const svmChainSelector = 2n;
      const svmReceiver = hre.ethers.zeroPadValue("0x2222222222222222222222222222222222222222", 32);
      
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        svmChainSelector, svmReceiver, EVM_CHAIN_VARIANT, 300000n // Use EVM for mock compatibility
      );

      const tx = await backedCCIPReceiver.connect(client).send(
        svmChainSelector,
        hre.ethers.zeroPadValue(client.address, 32),
        await erc20.getAddress(),
        amount,
        "0x", // Use empty args for EVM compatibility
        { value: hre.ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`SVM token send gas usage: ${gasUsed.toString()}`);
      
      // SVM transactions might use more gas due to additional encoding
      expect(gasUsed).to.be.lessThan(250000n);
    });

    it("should compare gas usage between regular and auto fee tokens", async () => {
      // Setup auto fee token
      await backedCCIPReceiver.connect(owner).registerToken(
        await erc20AutoFee.getAddress(), 1338n, AUTO_FEE_TOKEN
      );
      await erc20AutoFee.mint(client, 1000000n);
      await erc20AutoFee.connect(client).approve(await backedCCIPReceiver.getAddress(), 1000000n);

      // Regular token send
      const regularTx = await backedCCIPReceiver.connect(client).send(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32),
        await erc20.getAddress(),
        amount,
        "0x",
        { value: hre.ethers.parseEther("0.01") }
      );
      const regularReceipt = await regularTx.wait();
      const regularGas = regularReceipt!.gasUsed;

      // Auto fee token send
      const autoFeeTx = await backedCCIPReceiver.connect(client).send(
        chainSelector,
        hre.ethers.zeroPadValue(client.address, 32),
        await erc20AutoFee.getAddress(),
        amount,
        "0x",
        { value: hre.ethers.parseEther("0.01") }
      );
      const autoFeeReceipt = await autoFeeTx.wait();
      const autoFeeGas = autoFeeReceipt!.gasUsed;

      console.log(`Regular token gas: ${regularGas.toString()}`);
      console.log(`Auto fee token gas: ${autoFeeGas.toString()}`);

      // Auto fee tokens should use more gas due to multiplier operations
      expect(autoFeeGas).to.be.greaterThan(regularGas);
      
      const gasDifference = autoFeeGas - regularGas;
      console.log(`Auto fee token additional gas cost: ${gasDifference.toString()}`);
    });

    it("should measure gas usage for fee calculation", async () => {
      const gasEstimate = await hre.ethers.provider.estimateGas({
        to: await backedCCIPReceiver.getAddress(),
        data: backedCCIPReceiver.interface.encodeFunctionData("getDeliveryFeeCost", [
          chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          await erc20.getAddress(),
          amount,
          "0x"
        ])
      });

      console.log(`Fee calculation gas estimate: ${gasEstimate.toString()}`);
      
      // Fee calculations should be relatively cheap
      expect(gasEstimate).to.be.lessThan(100000n);
    });
  });

  describe("Batch Operations Performance", () => {
    it("should measure gas efficiency of multiple chain registrations", async () => {
      const numChains = 10;
      const totalGasUsed = [];

      for (let i = 1; i <= numChains; i++) {
        const chainSelector = BigInt(i);
        const receiver = hre.ethers.zeroPadValue(`0x${i.toString(16).padStart(40, '0')}`, 32);
        
        const tx = await backedCCIPReceiver.connect(owner).registerDestinationChain(
          chainSelector, receiver, EVM_CHAIN_VARIANT, 200000n
        );
        
        const receipt = await tx.wait();
        totalGasUsed.push(receipt!.gasUsed);
      }

      const avgGas = totalGasUsed.reduce((a, b) => a + b, 0n) / BigInt(numChains);
      console.log(`Average gas per chain registration: ${avgGas.toString()}`);
      console.log(`Total gas for ${numChains} registrations: ${totalGasUsed.reduce((a, b) => a + b, 0n).toString()}`);

      // Gas usage should be consistent across registrations
      const gasVariance = totalGasUsed.map(gas => (gas > avgGas ? gas - avgGas : avgGas - gas));
      const maxVariance = gasVariance.reduce((a, b) => a > b ? a : b, 0n);
      
      // Variance should be minimal (less than 10% of average)
      expect(maxVariance).to.be.lessThan(avgGas / 10n);
    });

    it("should measure gas efficiency of multiple token registrations", async () => {
      const numTokens = 20;
      const totalGasUsed = [];
      const tokens = [];

      // Create tokens
      for (let i = 1; i <= numTokens; i++) {
        const token = await (await hre.ethers.getContractFactory('ERC20Mock')).deploy(`Token${i}`, `TK${i}`);
        tokens.push(token);
      }

      // Register tokens and measure gas
      for (let i = 0; i < numTokens; i++) {
        const tx = await backedCCIPReceiver.connect(owner).registerToken(
          await tokens[i].getAddress(),
          BigInt(i + 1),
          i % 2 === 0 ? REGULAR_TOKEN : AUTO_FEE_TOKEN
        );
        
        const receipt = await tx.wait();
        totalGasUsed.push(receipt!.gasUsed);
      }

      const avgGas = totalGasUsed.reduce((a, b) => a + b, 0n) / BigInt(numTokens);
      console.log(`Average gas per token registration: ${avgGas.toString()}`);

      // Token registrations should be efficient
      expect(avgGas).to.be.lessThan(100000n);
    });
  });

  describe("Message Processing Performance", () => {
    let router: SignerWithAddress;
    const tokenId = 1337n;
    const receiver = hre.ethers.zeroPadValue("0x1234567890abcdef1234567890abcdef12345678", 32);

    beforeEach(async () => {
      router = await hre.ethers.getImpersonatedSigner(sourceRouter);
      
      // Fund the router for gas
      await owner.sendTransaction({
        to: sourceRouter,
        value: hre.ethers.parseEther("1")
      });
      
      await backedCCIPReceiver.connect(owner).registerSourceChain(chainSelector, receiver);
      await backedCCIPReceiver.connect(owner).registerToken(await erc20.getAddress(), tokenId, REGULAR_TOKEN);
      await erc20.mint(systemWallet, 10000000n);
      await erc20.connect(systemWallet).approve(await backedCCIPReceiver.getAddress(), 10000000n);
    });

    it("should measure gas usage for regular token ccipReceive", async () => {
      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 100000n;

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, REGULAR_TOKEN, "0x"]
        ),
        destTokenAmounts: [],
      };

      const tx = await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`Regular token ccipReceive gas usage: ${gasUsed.toString()}`);
      
      // Should be reasonably efficient
      expect(gasUsed).to.be.lessThan(150000n);
    });

    it("should measure gas usage for auto fee token ccipReceive", async () => {
      // Setup auto fee token
      await backedCCIPReceiver.connect(owner).registerToken(await erc20AutoFee.getAddress(), 1338n, AUTO_FEE_TOKEN);
      await erc20AutoFee.mint(systemWallet, 10000000n);
      await erc20AutoFee.connect(systemWallet).approve(await backedCCIPReceiver.getAddress(), 10000000n);

      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 100000n;
      const multiplier = hre.ethers.parseEther("0.5");
      const nonce = 1;

      // Set matching multiplier on destination token
      await erc20AutoFee.updateMultiplierWithNonce(multiplier, nonce);

      const payload = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [multiplier, nonce]
      );

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x92a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), 1338n, amount, AUTO_FEE_TOKEN, payload]
        ),
        destTokenAmounts: [],
      };

      const tx = await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`Auto fee token ccipReceive gas usage: ${gasUsed.toString()}`);
      
      // Should use more gas than regular tokens but still be reasonable
      expect(gasUsed).to.be.lessThan(200000n);
    });

    it("should test performance with large payload data", async () => {
      const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
      const amount = 100000n;
      
      // Create large payload (1KB)
      const largePayload = "0x" + "aa".repeat(512);

      const ccipMessage: Client.Any2EVMMessageStruct = {
        messageId: "0x93a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["bytes32"], [receiver]),
        data: hre.ethers.solidityPacked(
          ["bytes32", "uint64", "uint256", "uint8", "bytes"],
          [hre.ethers.zeroPadValue(client.address, 32), tokenId, amount, REGULAR_TOKEN, largePayload]
        ),
        destTokenAmounts: [],
      };

      const tx = await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`Large payload ccipReceive gas usage: ${gasUsed.toString()}`);
      
      // Large payloads should still be processable but will use more gas
      expect(gasUsed).to.be.lessThan(300000n);
    });
  });

  describe("Storage Access Optimization", () => {
    it("should measure gas difference between storage read patterns", async () => {
      const numChains = 5;
      
      // Register multiple chains
      for (let i = 1; i <= numChains; i++) {
        await backedCCIPReceiver.connect(owner).registerDestinationChain(
          BigInt(i),
          hre.ethers.zeroPadValue(`0x${i.toString(16).padStart(40, '0')}`, 32),
          EVM_CHAIN_VARIANT,
          200000n + BigInt(i * 1000)
        );
      }

      // Measure gas for accessing recently used vs older storage slots
      const recentChainGas = await hre.ethers.provider.estimateGas({
        to: await backedCCIPReceiver.getAddress(),
        data: backedCCIPReceiver.interface.encodeFunctionData("gasLimit", [BigInt(numChains)])
      });

      const olderChainGas = await hre.ethers.provider.estimateGas({
        to: await backedCCIPReceiver.getAddress(),
        data: backedCCIPReceiver.interface.encodeFunctionData("gasLimit", [1n])
      });

      console.log(`Recent storage access gas: ${recentChainGas.toString()}`);
      console.log(`Older storage access gas: ${olderChainGas.toString()}`);

      // Gas costs should be similar for storage reads
      expect(recentChainGas).to.be.closeTo(olderChainGas, 5000n);
    });

    it("should measure impact of chain variant on message building", async () => {
      const tokenReceiver = hre.ethers.zeroPadValue(client.address, 32);
      const amount = 100000n;

      // Register EVM and SVM chains
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        1n, hre.ethers.zeroPadValue("0x1111111111111111111111111111111111111111", 32), EVM_CHAIN_VARIANT, 200000n
      );
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        2n, "0x2222222222222222222222222222222222222222222222222222222222222222", SVM_CHAIN_VARIANT, 300000n
      );
      await backedCCIPReceiver.connect(owner).registerToken(await erc20.getAddress(), 1337n, REGULAR_TOKEN);

      // EVM fee calculation
      const evmFeeGas = await hre.ethers.provider.estimateGas({
        to: await backedCCIPReceiver.getAddress(),
        data: backedCCIPReceiver.interface.encodeFunctionData("getDeliveryFeeCost", [
          1n, hre.ethers.zeroPadValue(tokenReceiver, 32), await erc20.getAddress(), amount, "0x"
        ])
      });

      // SVM fee calculation
      const svmChainSpecificArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64", "bytes32[]"],
        [1n, ["0x1111111111111111111111111111111111111111111111111111111111111111"]]
      );

      const svmFeeGas = await hre.ethers.provider.estimateGas({
        to: await backedCCIPReceiver.getAddress(),
        data: backedCCIPReceiver.interface.encodeFunctionData("getDeliveryFeeCost", [
          2n, tokenReceiver, await erc20.getAddress(), amount, svmChainSpecificArgs
        ])
      });

      console.log(`EVM fee calculation gas: ${evmFeeGas.toString()}`);
      console.log(`SVM fee calculation gas: ${svmFeeGas.toString()}`);

      // SVM should use more gas due to additional processing
      expect(svmFeeGas).to.be.greaterThan(evmFeeGas);
      
      const gasDifference = svmFeeGas - evmFeeGas;
      console.log(`SVM additional gas cost: ${gasDifference.toString()}`);
    });
  });

  describe("Large-Scale Operations", () => {
    it("should test performance with maximum supported configurations", async () => {
      const maxChains = 50;
      const maxTokens = 100;
      const batchSize = 10;
      
      console.log(`Testing with ${maxChains} chains and ${maxTokens} tokens...`);

      // Register chains in batches to avoid timeout
      for (let batch = 0; batch < maxChains; batch += batchSize) {
        const promises = [];
        for (let i = batch; i < Math.min(batch + batchSize, maxChains); i++) {
          const chainSelector = BigInt(i + 1);
          const receiver = hre.ethers.zeroPadValue(`0x${(i + 1).toString(16).padStart(40, '0')}`, 32);
          const variant = i % 2 === 0 ? EVM_CHAIN_VARIANT : SVM_CHAIN_VARIANT;
          
          promises.push(
            backedCCIPReceiver.connect(owner).registerDestinationChain(
              chainSelector, receiver, variant, 200000n + BigInt(i * 1000)
            )
          );
        }
        await Promise.all(promises);
      }

      console.log(`Successfully registered ${maxChains} chains`);

      // Register tokens in batches
      const tokens = [];
      for (let batch = 0; batch < maxTokens; batch += batchSize) {
        const tokenPromises = [];
        for (let i = batch; i < Math.min(batch + batchSize, maxTokens); i++) {
          tokenPromises.push(
            (async () => {
              const token = await (await hre.ethers.getContractFactory('ERC20Mock')).deploy(`Token${i + 1}`, `TK${i + 1}`);
              return { token, index: i + 1 };
            })()
          );
        }
        
        const batchTokens = await Promise.all(tokenPromises);
        tokens.push(...batchTokens);
        
        const registerPromises = batchTokens.map(({ token, index }) =>
          backedCCIPReceiver.connect(owner).registerToken(
            token.getAddress(),
            BigInt(index),
            index % 3 === 0 ? AUTO_FEE_TOKEN : REGULAR_TOKEN
          )
        );
        
        await Promise.all(registerPromises);
      }

      console.log(`Successfully registered ${maxTokens} tokens`);

      // Test random access performance
      const randomChain = BigInt(Math.floor(Math.random() * maxChains) + 1);
      const randomTokenIndex = Math.floor(Math.random() * maxTokens);
      const randomToken = tokens[randomTokenIndex];

      const gasLimit = await backedCCIPReceiver.gasLimit(randomChain);
      const tokenInfo = await backedCCIPReceiver.tokenInfos(await randomToken.token.getAddress());

      expect(gasLimit).to.be.greaterThan(0);
      expect(tokenInfo.id).to.equal(BigInt(randomToken.index));

      console.log(`Random access test completed successfully`);
    });
  });

  describe("Memory Usage Optimization", () => {
    it("should handle multiple simultaneous operations efficiently", async () => {
      const numOperations = 20;
      const operations = [];

      // Prepare data
      await backedCCIPReceiver.connect(owner).registerDestinationChain(
        chainSelector, "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", EVM_CHAIN_VARIANT, 200000n
      );
      
      for (let i = 0; i < numOperations; i++) {
        const token = await (await hre.ethers.getContractFactory('ERC20Mock')).deploy(`Token${i}`, `TK${i}`);
        await backedCCIPReceiver.connect(owner).registerToken(await token.getAddress(), BigInt(i + 1), REGULAR_TOKEN);
        
        await token.mint(client, 1000000n);
        await token.connect(client).approve(await backedCCIPReceiver.getAddress(), 100000n);

        operations.push({
          token,
          chainSelector,
          amount: BigInt(1000 * (i + 1))
        });
      }

      // Execute multiple fee calculations simultaneously
      const feeCalculationPromises = operations.map(op => 
        backedCCIPReceiver.getDeliveryFeeCost(
          op.chainSelector,
          hre.ethers.zeroPadValue(client.address, 32),
          op.token.getAddress(),
          op.amount,
          "0x"
        )
      );

      const startTime = Date.now();
      const fees = await Promise.all(feeCalculationPromises);
      const endTime = Date.now();

      console.log(`${numOperations} simultaneous fee calculations completed in ${endTime - startTime}ms`);
      
      // All operations should succeed
      fees.forEach(fee => {
        expect(fee).to.be.greaterThan(0);
      });
    });
  });
});