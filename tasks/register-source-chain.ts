import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { BACKED_CCIP_RECEIVER } from "../helpers/constants";

task(
  `register-source-chain`,
  `Registers message source chain in BackedCCIPReceiver smart contract`
)
  .addParam(`sourceChainSelector`, `Registered source chain selector`)
  .addParam(`sender`, `Source chain sender`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const sourceChainSelector = taskArguments.sourceChainSelector
      const sender = taskArguments.sender

      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to register source chain selector ${sourceChainSelector} in BackedCCIPReceiver on the ${hre.network.name} blockchain.`
      );
      spinner.start();

      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver"
        )) as BackedCCIPReceiver__factory;

      const contract = factory.attach(BACKED_CCIP_RECEIVER[hre.network.name]) as BackedCCIPReceiver;

      await contract.registerSourceChain(sourceChainSelector, sender);

      spinner.stop();
      console.log(
        `✅ Source chain ${sourceChainSelector} registered in BackedReceiverCCIP on ${hre.network.name} blockchain`
      );
    }
  );
