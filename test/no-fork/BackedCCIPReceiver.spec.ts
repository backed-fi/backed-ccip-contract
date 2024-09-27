import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {
  BackedCCIPReceiver,
  BasicMessageReceiver,
  CustomFeeCCIPLocalSimulator,
  ERC20Mock,
} from "../../typechain-types";
import {
  getRouterConfig,
} from "../../helpers/utils";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Client } from "../../typechain-types/@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver";

const token = {
  id: 1337,
  name: 'Backed IBTA',
  symbol: 'bIBTA'
}

const REGULAR_TOKEN = 0n;
const AUTO_FEE_TOKEN = 1n;

const PRODUCT_ID = 102392n;
const ANOTHER_PRODUCT_ID = 34039n;

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
      await hre.upgrades.deployProxy(factory, [sourceRouter, systemWallet.address, 100_000]) as unknown as BackedCCIPReceiver;
    const backedCCIPReceiverAddress = await backedCCIPReceiver.getAddress();

    const basicReceiverFactory = await hre.ethers.getContractFactory(
      "BasicMessageReceiver"
    );

    const basicReceiver = await basicReceiverFactory.deploy(sourceRouter);
    const basicReceiverAddress = await basicReceiver.getAddress();

    const tokenFactory = await hre.ethers.getContractFactory(
      'ERC20Mock'
    );
    const erc20 = await tokenFactory.deploy(token.name, token.symbol);
    const anotherErc20 = await tokenFactory.deploy('Backed Fake token', 'bFAKE');
    const erc20Address = await erc20.getAddress();
    const anotherErc20Address = await anotherErc20.getAddress();

    return {
      client, random, systemWallet, deployer, chainSelector, anotherChainSelector, sourceRouter,
      backedCCIPReceiver, backedCCIPReceiverAddress, basicReceiver, basicReceiverAddress, erc20, erc20Address, anotherErc20Address
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

  let erc20: ERC20Mock;
  let erc20Address: string;
  let anotherErc20Address: string;

  beforeEach(async () => {
    ({
      client, random, systemWallet, deployer, chainSelector, anotherChainSelector, sourceRouter,
      backedCCIPReceiver, backedCCIPReceiverAddress, basicReceiver, basicReceiverAddress, erc20, erc20Address, anotherErc20Address
    } = await loadFixture(deployFixture));

    await client.sendTransaction({
      to: sourceRouter,
      value: 1_000_000_000_000_000_000n,
    });
    await random.sendTransaction({
      to: deployer,
      value: 1_000_000_000_000_000_000n,
    });

    await erc20.mint(client, 1_000_000n);
  });

  it('owner is deployer', async () => {
    expect(await backedCCIPReceiver.owner()).to.equal(deployer.address)
  });

  describe('#constructor', () => {
    describe('when `initialize` is called again', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.initialize(sourceRouter, systemWallet.address, 200_000)).to
          .revertedWithCustomError(backedCCIPReceiver, 'InvalidInitialization')
      });
    });
  });

  describe('#registerDestinationChain', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).registerDestinationChain(chainSelector, backedCCIPReceiverAddress)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_receiver` is equal to zero address', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerDestinationChain(chainSelector, hre.ethers.ZeroAddress)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InvalidAddress');
      });
    });
    it('should register `_receiver` for `_destinationChainSelector`', async () => {
      await backedCCIPReceiver.registerDestinationChain(chainSelector, backedCCIPReceiverAddress);

      expect(await backedCCIPReceiver.allowlistedDestinationChains(chainSelector)).to.equal(backedCCIPReceiverAddress)
    });
  });
  describe('#removeDestinationChain', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(chainSelector, backedCCIPReceiverAddress);
    })
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).removeDestinationChain(chainSelector)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_destinationChainSelector` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.removeDestinationChain(anotherChainSelector)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'DestinationChainNotAllowlisted');
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
          backedCCIPReceiver.connect(random).registerSourceChain(chainSelector, backedCCIPReceiverAddress)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    it('should update `_sourceChainSelector` value', async () => {
      await backedCCIPReceiver.registerSourceChain(chainSelector, backedCCIPReceiverAddress);

      expect(await backedCCIPReceiver.allowlistedSourceChains(chainSelector)).to.deep.equal(backedCCIPReceiverAddress);
    });
  });
  describe('#removeSourceChain', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerSourceChain(chainSelector, backedCCIPReceiverAddress);
    })
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).removeSourceChain(chainSelector)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_sourceChainSelector` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.removeSourceChain(anotherChainSelector)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'SourceChainNotAllowlisted');
      });
    });

    it('should update `_sender` value', async () => {
      let sourceChainSender = await backedCCIPReceiver.allowlistedSourceChains(chainSelector);

      expect(sourceChainSender).to.deep.equal(backedCCIPReceiverAddress);

      await backedCCIPReceiver.removeSourceChain(chainSelector);

      sourceChainSender = await backedCCIPReceiver.allowlistedDestinationChains(chainSelector);

      expect(sourceChainSender).to.deep.equal(hre.ethers.ZeroAddress);
    });
  });
  describe('#updateCustodyWallet', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).updateCustodyWallet(random.address)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
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
          backedCCIPReceiver.connect(random).updateGasLimit(300_000)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount')
      });
    });
    it('should update default gas limit to `_gasLimit`', async () => {
      await backedCCIPReceiver.updateGasLimit(300_000);

      expect(await backedCCIPReceiver.gasLimit()).to.be.equal(300_000);
    });
  });
  describe('#registerToken', () => {
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).registerToken(erc20Address, 1, 0)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_tokenId` is equal 0', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(erc20Address, 0, REGULAR_TOKEN)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenId');
      });
    });
    describe('when `_tokenId` is already registered', () => {
      beforeEach(async () => {
        await backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID, REGULAR_TOKEN);
      })
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(anotherErc20Address, PRODUCT_ID, REGULAR_TOKEN)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenId');
      });
    });
    describe('when `_token` is equal zero address', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(hre.ethers.ZeroAddress, PRODUCT_ID, REGULAR_TOKEN)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenAddress');
      });
    });
    describe('when `_token` is already registered', () => {
      beforeEach(async () => {
        await backedCCIPReceiver.registerToken(erc20Address, ANOTHER_PRODUCT_ID, REGULAR_TOKEN);
      })
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID, REGULAR_TOKEN)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenAddress');
      });
    });
    it('should set mapping from `_tokenId` to `_token`', async () => {
      await backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID, REGULAR_TOKEN);
      const [tokenId, variant] = await backedCCIPReceiver.tokenInfos(erc20Address)

      expect(tokenId).to.eq(PRODUCT_ID);
      expect(variant).to.eq(REGULAR_TOKEN);
      expect(await backedCCIPReceiver.tokens(PRODUCT_ID)).to.be.equal(erc20Address);
    });
  });
  describe('#removeToken', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID, REGULAR_TOKEN);
    })
    describe('when `msg.sender` is not owner', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(random).removeToken(erc20Address)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'OwnableUnauthorizedAccount');
      });
    });
    describe('when `_token` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.removeToken(anotherErc20Address)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'TokenNotRegistered');
      });
    });

    it('should remove token', async () => {
      let [tokenId] = await backedCCIPReceiver.tokenInfos(erc20Address);

      expect(tokenId).to.deep.equal(PRODUCT_ID);

      await backedCCIPReceiver.removeToken(erc20Address);
      [tokenId] = await backedCCIPReceiver.tokenInfos(erc20Address);

      expect(tokenId).to.deep.equal(0);
    });
  });
  describe('#getDeliveryFeeCost', () => {
    it('should return CCIP fee cost', async () => {
      /// Hardcoded value in mocked ccip router
      expect(
        await backedCCIPReceiver.getDeliveryFeeCost(chainSelector, client.address, erc20Address, 200_000n)
      ).to.equal(1)
    })
  });
  describe('#send', () => {
    beforeEach(async () => {
      await backedCCIPReceiver.registerDestinationChain(chainSelector, basicReceiverAddress);
      await backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID, REGULAR_TOKEN);

      await erc20.connect(client).approve(backedCCIPReceiverAddress, 1_000_000n);
    });
    describe('and `_destinationChainSelector` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(anotherChainSelector, client.address, erc20Address, 200_000n)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'DestinationChainNotAllowlisted');
      });
    });
    describe('and `_token` is not registered', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(chainSelector, client.address, anotherErc20Address, 200_000n)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'TokenNotRegistered');
      });
    });
    describe('and `_token` is empty address', () => {
      beforeEach(async () => {
        await backedCCIPReceiver.registerDestinationChain(chainSelector, backedCCIPReceiverAddress);
      })
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(chainSelector, client.address, hre.ethers.ZeroAddress, 200_000n)
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InvalidTokenAddress');
      });
    });

    describe('and `msg.value` is lower than CCIP fee costs', () => {
      it('should revert', async () => {
        await expect(
          backedCCIPReceiver.connect(client).send(chainSelector, client.address, erc20Address, 200_000n, { value: 0 })
        ).to.revertedWithCustomError(backedCCIPReceiver, 'InsufficientMessageValue')
      });
    });

    it('should send tokens to custody wallet', async () => {
      await backedCCIPReceiver.connect(client).send(chainSelector, client.address, erc20Address, 200_000n, { value: 1 });
      const clientBalance = await erc20.balanceOf(client.address);
      const custodyBalance = await erc20.balanceOf(systemWallet.address);

      expect(clientBalance).to.equal(1_000_000n - 200_000n);
      expect(custodyBalance).to.equal(200_000n);
    });

    it('should send CCIP message', async () => {
      const tx = await backedCCIPReceiver.connect(client).send(chainSelector, client.address, erc20Address, 200_000n, { value: 1_000_000_000_000_000_000n });

      const [lastMessageId, tokenReceiver, tokenId, amount] = await basicReceiver.getLatestMessageDetails();

      expect(tokenReceiver).to.deep.equal(client.address);
      expect(tokenId).to.deep.equal(PRODUCT_ID);
      expect(amount).to.deep.equal(200_000n);
    });
  });
  describe('#receiveCCIP', () => {
    const defaultAbiCoder = hre.ethers.AbiCoder.defaultAbiCoder();

    let ccipMessage: Client.Any2EVMMessageStruct;
    beforeEach(async () => {
      ccipMessage = {
        messageId: "0x91a2d259e3fa0be5050528a6770a0726d22c7a876d5ec3cbf38841cf4a5e35cf",
        sourceChainSelector: chainSelector,
        sender: defaultAbiCoder.encode(["address"], [backedCCIPReceiverAddress]),
        data: defaultAbiCoder.encode(["address", "uint64", "uint256", "uint8"], [client.address, PRODUCT_ID, 200_000n, REGULAR_TOKEN]), // no data
        destTokenAmounts: [],
      };

      await backedCCIPReceiver.registerSourceChain(chainSelector, backedCCIPReceiverAddress);

      await backedCCIPReceiver.registerToken(erc20Address, PRODUCT_ID, REGULAR_TOKEN);

      await erc20.mint(systemWallet, 1_000_000n);
      await erc20.connect(systemWallet).approve(backedCCIPReceiver, 1_000_000n);
    })
    describe('and `msg.sender` is not CCIP rounter', () => {
      beforeEach(() => {

      })
      it('should revert', async () => {
        await expect(backedCCIPReceiver.ccipReceive(ccipMessage))
          .to.revertedWithCustomError(backedCCIPReceiver, 'InvalidRouter')
      });
    });
    describe('and CCIP message sender is not registered', () => {
      it('should emit `InvalidMessageReceived` with `SOURCE_SENDER_NOT_ALLOWLISTED`', async () => {
        const router = await hre.ethers.getImpersonatedSigner(sourceRouter);

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
        const router = await hre.ethers.getImpersonatedSigner(sourceRouter);

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
        const router = await hre.ethers.getImpersonatedSigner(sourceRouter);

        await expect(backedCCIPReceiver.connect(router).ccipReceive({
          ...ccipMessage,
          data: defaultAbiCoder.encode(["address", "uint64", "uint256", "uint8"], [client.address, 2, 200_000n, REGULAR_TOKEN]), // no data
        }))
          .to.emit(backedCCIPReceiver, 'InvalidMessageReceived')
          .withArgs(ccipMessage.messageId, 2)
      })
    });

    it('should send token from custody to receiver', async () => {
      const router = await hre.ethers.getImpersonatedSigner(sourceRouter);

      await backedCCIPReceiver.connect(router).ccipReceive(ccipMessage);

      const clientBalance = await erc20.balanceOf(client.address);

      expect(clientBalance).to.deep.equal(1_000_000n + 200_000n)
    });
  })
});