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
  `remove-source-chain`,
  `Removes source chain from BackedCCIPReceiver smart contract`
)
  .addParam(`sourceChainSelector`, `Registered source chain selector`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const sourceChainSelector = taskArguments.sourceChainSelector

      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to remove source chain selector: ${sourceChainSelector} from BackedCCIPReceiver on the ${hre.network.name} blockchain`
      );
      spinner.start();

      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver"
        )) as BackedCCIPReceiver__factory;

      const contract = factory.attach(BACKED_CCIP_RECEIVER[hre.network.name]) as BackedCCIPReceiver;

      await contract.removeSourceChain(sourceChainSelector);

      spinner.stop();
      console.log(
        `✅ Removed source chain: ${sourceChainSelector} from BackedReceiverCCIP on ${hre.network.name} blockchain`
      );
    }
  );
