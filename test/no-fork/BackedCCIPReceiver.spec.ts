import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import {
  BackedCCIPReceiver,
  BasicMessageReceiver,
  CustomFeeCCIPLocalSimulator,
  ERC20AutoFeeMock,
} from "../../typechain-types";
import {
  getRouterConfig,
} from "../../helpers/utils";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Client } from "../../typechain-types/@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver";
import { nthRoot } from "../../helpers/nthRoot";
import Decimal from "decimal.js";

const token = {
  id: 1337,
  name: 'Backed IBTA',
  symbol: 'bIBTA'
}

const autoFeeToken = {
  id: 999,
  name: 'Backed nVIDIA',
  symbol: 'bNVDA'
}

const EVM_CHAIN_VARIANT = 0n;

const PRODUCT_ID = 102392n;
const ANOTHER_PRODUCT_ID = 34039n;

const INITIAL_BALANCE = 1_000_000n;
const MULTIPLIER = 1.0;

describe("Backed CCIP Receiver tests", () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [client, random, systemWallet] = await hre.ethers.getSigners();
    const deployer = await hre.ethers.provider.getSigner();

    const ccipLocalSimualtorFactory = await hre.ethers.getContractFactory(
      "CustomFeeCCIPLocalSimulator"
    );
    const ccipLocalSimulator: CustomFeeCCIPLocalSimulator =
      await ccipLocalSimualtorFactory.deploy();

    const {
      chainSelector_: chainSelector,
      sourceRouter_: sourceRouter
    } = await ccipLocalSimulator.configuration();
    const {
      chainSelector: anotherChainSelector,
    } = getRouterConfig('polygonAmoy');

    const factory = await hre.ethers.getContractFactory(
      "BackedCCIPReceiver"
    );
    const backedCCIPReceiver =
      await hre.upgrades.deployProxy(factory, [sourceRouter, systemWallet.address]) as unknown as BackedCCIPReceiver;
    const backedCCIPReceiverAddress = await backedCCIPReceiver.getAddress();

    const basicReceiverFactory = await hre.ethers.getContractFactory(
      "BasicMessageReceiver"
    );

    const basicReceiver = await basicReceiverFactory.deploy(sourceRouter);
    const basicReceiverAddress = await basicReceiver.getAddress();

    const autoFeeTokenFactory = await hre.ethers.getContractFactory(
      'ERC20AutoFeeMock'
    );
    const erc20AutoFee = await autoFeeTokenFactory.deploy(autoFeeToken.name, autoFeeToken.symbol)
    const erc20AutoFeeAddress = await erc20AutoFee.getAddress();

    const tokenFactory = await hre.ethers.getContractFactory(
      'ERC20AutoFeeMock'
    );
    const erc20 = await tokenFactory.deploy(token.name, token.symbol);
    const anotherErc20 = await tokenFactory.deploy('Backed Fake token', 'bFAKE');
    const erc20Address = await erc20.getAddress();
    const anotherErc20Address = await anotherErc20.getAddress();

    return {
      client, random, systemWallet, deployer, chainSelector, anotherChainSelector, sourceRouter,
      backedCCIPReceiver, backedCCIPReceiverAddress, basicReceiver, basicReceiverAddress, erc20, erc20Address, anotherErc20Address, erc20AutoFee, erc20AutoFeeAddress
    };
  }

  let client: SignerWithAddress;
  let systemWallet: SignerWithAddress;
  let random: SignerWithAddress;

  let deployer: SignerWithAddress;

  let chainSelector: bigint;
  let anotherChainSelector: string;

  let sourceRouter: string;

  let backedCCIPReceiver: BackedCCIPReceiver;
  let backedCCIPReceiverAddress: string;

  let basicReceiver: BasicMessageReceiver;
  let basicReceiverAddress: string;

  let erc20: ERC20AutoFeeMock;
  let erc20Address: string;
  let anotherErc20Address: string;

  let erc20AutoFee: ERC20AutoFeeMock;
  let erc20AutoFeeAddress: string;

  beforeEach(async () => {
    ({
      client, random, systemWallet, deployer, chainSelector, anotherChainSelector, sourceRouter,
      backedCCIPReceiver, backedCCIPReceiverAddress, basicReceiver, basicReceiverAddress, erc20, erc20Address, anotherErc20Address,
      erc20AutoFee, erc20AutoFeeAddress
    } = await loadFixture(deployFixture));

    await client.sendTransaction({
      to: sourceRouter,
      value: 1_000_000_000_000_000_000n,
    });
    await random.sendTransaction({
      to: deployer,
      value: 1_000_000_000_000_000_000n,
    });

    await erc20AutoFee.mint(client, INITIAL_BALANCE);

    await erc20AutoFee.updateMultiplierValue(new Decimal(MULTIPLIER).mul(1e18).toString());
  });

  it('owner is deployer', async () => {
    expect(await backedCCIPReceiver.owner()).to.equal(deployer.address)
  });
  describe('#constructor', () => {
    describe('when `initialize` is called again', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.initialize(sourceRouter, systemWallet.address)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidInitialization')
      });
    });
  });
  describe('#registerDestinationChain', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).registerDestinationChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32), EVM_CHAIN_VARIANT, 200_000)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_receiver` is equal to zero address', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerDestinationChain(chainSelector, hre.ethers.zeroPadValue(hre.ethers.ZeroAddress, 32), EVM_CHAIN_VARIANT, 200_000)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidAddress');
      });
    });
    it('should register `_receiver` for `_destinationChainSelector`', async () => {
      await backedCCIPReceiver.registerDestinationChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32), EVM_CHAIN_VARIANT, 200_000);

      expect(await backedCCIPReceiver.allowlistedDestinationChains(chainSelector)).to.equal(hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32));
    });
  });
  describe('#removeDestinationChain', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32), EVM_CHAIN_VARIANT, 200_000);
    })
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).removeDestinationChain(chainSelector)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_destinationChainSelector` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.removeDestinationChain(anotherChainSelector)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'DestinationChainNotAllowlisted');
      });
    });

    it('should remove destination chain', async () => {
      let destinationChainReceiver = await backedCCIPReceiver.allowlistedDestinationChains(chainSelector);

      expect(destinationChainReceiver).to.deep.equal(backedCCIPReceiverAddress);

      await backedCCIPReceiver.removeDestinationChain(chainSelector);

      destinationChainReceiver = await backedCCIPReceiver.allowlistedDestinationChains(chainSelector);

      expect(destinationChainReceiver).to.deep.equal(hre.ethers.ZeroAddress);
    });
  });
  describe('#allowlistSourceChain', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).registerSourceChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32))
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    it('should update `_sourceChainSelector` value', async () => {
      await backedCCIPReceiver.registerSourceChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32));

      expect(await backedCCIPReceiver.allowlistedSourceChains(chainSelector)).to.deep.equal(backedCCIPReceiverAddress);
    });
  });
  describe('#removeSourceChain', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerSourceChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32));
    })
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).removeSourceChain(chainSelector)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_sourceChainSelector` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.removeSourceChain(anotherChainSelector)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'SourceChainNotAllowlisted');
      });
    });

    it('should update `_sender` value', async () => {
      let sourceChainSender = await backedCCIPReceiver.allowlistedSourceChains(chainSelector);

      expect(sourceChainSender).to.deep.equal(backedCCIPReceiverAddress);

      await backedCCIPReceiver.removeSourceChain(chainSelector);

      sourceChainSender = await backedCCIPReceiver.allowlistedSourceChains(chainSelector);

      expect(sourceChainSender).to.deep.equal(hre.ethers.ZeroHash);
    });
  });
  describe('#updateCustodyWallet', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).updateCustodyWallet(random.address)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    it('should update custody wallet to `_custodyWallet`', async () => {
      await backedCCIPReceiver.updateCustodyWallet(random.address);

      expect(await backedCCIPReceiver.custodyWallet()).to.be.equal(random.address);
    });
  });
  describe('#updateGasLimit', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).updateGasLimit(chainSelector, 300_000)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount')
      });
    });
    it('should update default gas limit to `_gasLimit`', async () => {
      await backedCCIPReceiver.updateGasLimit(chainSelector, 300_000);

      expect(await backedCCIPReceiver.gasLimit(chainSelector)).to.be.equal(300_000);
    });
  });
  describe('#registerToken', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).registerToken(erc20Address, 1)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_tokenId` is equal 0', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(erc20Address, 0)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenId');
      });
    });
    describe('when `_tokenId` is already registered', () => {
      beforeEach(async () => {
        await backedCCIPReceiver.registerToken(erc20AutoFeeAddress, PRODUCT_ID);
      })
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(anotherErc20Address, PRODUCT_ID)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenId');
      });
    });
    describe('when `_token` is equal zero address', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(hre.ethers.ZeroAddress, PRODUCT_ID)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenAddress');
      });
    });
    describe('when `_token` is already registered', () => {
      beforeEach(async () => {
        await backedCCIPReceiver.registerToken(erc20Address, ANOTHER_PRODUCT_ID);
      })
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenAddress');
      });
    });
    it('should set mapping from `_tokenId` to `_token` and from `_token` to `tokenInfo`', async () => {
      await backedCCIPReceiver.registerToken(erc20AutoFeeAddress, PRODUCT_ID);
      const tokenId = await backedCCIPReceiver.tokenInfos(erc20AutoFeeAddress)

      expect(tokenId).to.eq(PRODUCT_ID);
      expect(await backedCCIPReceiver.tokens(PRODUCT_ID)).to.be.equal(erc20AutoFeeAddress);
    });
  });
  describe('#removeToken', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerToken(erc20AutoFeeAddress, PRODUCT_ID);
    })
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).removeToken(erc20Address)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_token` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.removeToken(anotherErc20Address)
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'TokenNotRegistered');
      });
    });

    it('should remove token', async () => {
      let tokenId = await backedCCIPReceiver.tokenInfos(erc20AutoFeeAddress);

      expect(tokenId).to.deep.equal(PRODUCT_ID);

      await backedCCIPReceiver.removeToken(erc20AutoFeeAddress);
      tokenId = await backedCCIPReceiver.tokenInfos(erc20AutoFeeAddress);

      expect(tokenId).to.deep.equal(0);
    });
  });
  describe('#getDeliveryFeeCost', () => {
    it('should return CCIP fee cost', async () => {
      /// Hardcoded value in mocked ccip router
      expect(
        await backedCCIPReceiver.getDeliveryFeeCost(chainSelector, hre.ethers.zeroPadValue(client.address, 32), erc20AutoFeeAddress, 200_000n, '0x')
      ).to.equal(1n)
    })
  });
  describe('#send', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(chainSelector, hre.ethers.zeroPadValue(basicReceiverAddress, 32), EVM_CHAIN_VARIANT, 200_000);
      await backedCCIPReceiver.registerToken(erc20AutoFeeAddress, PRODUCT_ID);
      await backedCCIPReceiver.registerToken(erc20Address, ANOTHER_PRODUCT_ID);

      await erc20AutoFee.connect(client).approve(backedCCIPReceiverAddress, INITIAL_BALANCE);
    });
    describe('and `_destinationChainSelector` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(anotherChainSelector, hre.ethers.zeroPadValue(client.address, 32), erc20AutoFeeAddress, 200_000n, '0x')
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'DestinationChainNotAllowlisted');
      });
    });
    describe('and `_token` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(chainSelector, hre.ethers.zeroPadValue(client.address, 32), anotherErc20Address, 200_000n, '0x')
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'TokenNotRegistered');
      });
    });
    describe('and `_token` is empty address', () => {
      beforeEach(async () => {
        await backedCCIPReceiver.registerDestinationChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32), EVM_CHAIN_VARIANT, 200_000);
      })
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(chainSelector, hre.ethers.zeroPadValue(client.address, 32), hre.ethers.ZeroAddress, 200_000n, '0x')
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenAddress');
      });
    });
    describe('and `msg.value` is lower than CCIP fee costs', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(chainSelector, hre.ethers.zeroPadValue(client.address, 32), erc20AutoFeeAddress, 200_000n, '0x', { value: 0 })
        ).to.be.revertedWithCustomError(backedCCIPReceiver, 'InsufficientMessageValue')
      });
    });
    it('should send tokens to custody wallet', async () => {
      const bridgeAmount = 200_000n;
      const initialClientBalance = await erc20AutoFee.balanceOf(client.address);
      console.log(`Initial client balance: ${initialClientBalance}, expected: ${INITIAL_BALANCE}`);

      await backedCCIPReceiver.connect(client).send(chainSelector, hre.ethers.zeroPadValue(client.address, 32), erc20AutoFeeAddress, bridgeAmount, '0x', { value: 1 });
      const clientBalance = await erc20AutoFee.balanceOf(client.address);
      const custodyBalance = await erc20AutoFee.balanceOf(systemWallet.address);

      expect(clientBalance).to.equal(initialClientBalance - bridgeAmount);
      expect(custodyBalance).to.equal(bridgeAmount);
    });

    it('should send CCIP message', async () => {
      const bridgeAmount = 200_000n;
      const tx = await backedCCIPReceiver.connect(client).send(chainSelector, hre.ethers.zeroPadValue(client.address, 32), erc20AutoFeeAddress, bridgeAmount, '0x', { value: 1_000_000_000_000_000_000n });

      const [lastMessageId, tokenReceiver, tokenId, amount] = await basicReceiver.getLatestMessageDetails();

      expect(tokenReceiver).to.deep.equal(client.address);
      expect(tokenId).to.deep.equal(PRODUCT_ID);
      expect(amount).to.deep.equal(bridgeAmount);
    });
  });
  describe('#receiveCCIP', () => {
    const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
    const bridgeAmount = 200_000n;

    let ccipMessage: Client.Any2EVMMessageStruct;
    let router: SignerWithAddress;
    beforeEach(async () => {
      ccipMessage = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["address"], [backedCCIPReceiverAddress]),
        data: hre.ethers.solidityPacked(["bytes32", "uint64", "uint256"], [hre.ethers.zeroPadValue(client.address, 32), PRODUCT_ID, bridgeAmount]),
        destTokenAmounts: [],
      };
      router = await hre.ethers.getImpersonatedSigner(sourceRouter);

      await backedCCIPReceiver.registerSourceChain(chainSelector, hre.ethers.zeroPadValue(backedCCIPReceiverAddress, 32));

      await backedCCIPReceiver.registerToken(erc20AutoFeeAddress, PRODUCT_ID);
      await backedCCIPReceiver.registerToken(erc20Address, ANOTHER_PRODUCT_ID);

      await erc20AutoFee.mint(systemWallet, INITIAL_BALANCE);
      await erc20AutoFee.connect(systemWallet).approve(backedCCIPReceiver, INITIAL_BALANCE);
    })
    describe('and `msg.sender` is not CCIP rounter', () => {
      it('should revert', async () => {
        await expect(backedCCIPReceiver.ccipReceive(ccipMessage))
          .to.revertedWithCustomError(backedCCIPReceiver, 'InvalidRouter')
      });
    });
    describe('and CCIP message sender is not registered', () => {
      it('should emit `InvalidMessageReceived` with `SOURCE_SENDER_NOT_ALLOWLISTED`', async () => {
        await expect(backedCCIPReceiver.connect(router).ccipReceive({
          ...ccipMessage,
          sender: defaultAbiCoder.encode(["address"], [random.address])
        }))
          .to.emit(backedCCIPReceiver, 'InvalidMessageReceived')
          .withArgs(ccipMessage.messageId, 1)
      });
    });
    describe('and source chain is not registered', () => {
      it('should emit `InvalidMessageReceived` with `SOURCE_CHAIN_SELECTOR_NOT_ALLOWLISTED`', async () => {
        await expect(backedCCIPReceiver.connect(router).ccipReceive({
          ...ccipMessage,
          sourceChainSelector: anotherChainSelector
        }))
          .to.emit(backedCCIPReceiver, 'InvalidMessageReceived')
          .withArgs(ccipMessage.messageId, 0)
      });
    });

    describe('and token is not registered', () => {
      it('should emit `InvalidMessageReceived` with `TOKEN_NOT_REGISTERED`', async () => {
        await expect(backedCCIPReceiver.connect(router).ccipReceive({
          ...ccipMessage,
          data: hre.ethers.solidityPacked(["bytes32", "uint64", "uint256"], [hre.ethers.zeroPadValue(client.address, 32), 2, 200_000n]),
        }))
          .to.emit(backedCCIPReceiver, 'InvalidMessageReceived')
          .withArgs(ccipMessage.messageId, 2)
      })
    });
    describe('and token receiver is not valid address', () => {
      it('should emit `InvalidMessageReceived` with `TOKEN_RECEIVER_INVALID`', async () => {
        await expect(backedCCIPReceiver.connect(router).ccipReceive({
          ...ccipMessage,
          data: hre.ethers.solidityPacked(["bytes32", "uint64", "uint256"], [hre.ethers.zeroPadValue(hre.ethers.ZeroAddress, 32), PRODUCT_ID, 200_000n]),
        }))
          .to.emit(backedCCIPReceiver, 'InvalidMessageReceived')
          .withArgs(ccipMessage.messageId, 3)
      })
    })
    it('should send token from custody to receiver', async () => {
      const initialBalance = await erc20AutoFee.balanceOf(client.address);
      const custodyBalance = await erc20AutoFee.balanceOf(systemWallet.address);
      console.log(`Initial balances - client: ${initialBalance}, custody: ${custodyBalance}, bridgeAmount: ${bridgeAmount}`);

      await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);

      const clientBalance = await erc20AutoFee.balanceOf(client.address);
      const custodyBalanceAfter = await erc20AutoFee.balanceOf(systemWallet.address);
      console.log(`Final balances - client: ${clientBalance}, custody: ${custodyBalanceAfter}`);
      console.log(`Client received: ${clientBalance - initialBalance}, expected: ${bridgeAmount}`);

      expect(clientBalance).to.deep.equal(initialBalance + bridgeAmount)
    });
  })
});
