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
  `remove-destination-chain`,
  `Removes destination chain from BackedCCIPReceiver smart contract`
)
  .addParam(`destinationChainSelector`, `Registered destination chain selector`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const destinationChainSelector = taskArguments.destinationChainSelector

      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to remove destination chain selector: ${destinationChainSelector} from BackedCCIPReceiver on the ${hre.network.name} blockchain`
      );
      spinner.start();

      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver"
        )) as BackedCCIPReceiver__factory;

      const contract = factory.attach(BACKED_CCIP_RECEIVER[hre.network.name]) as BackedCCIPReceiver;

      await contract.removeDestinationChain(destinationChainSelector);

      spinner.stop();
      console.log(
        `✅ Removed destination chain: ${destinationChainSelector} from BackedReceiverCCIP on ${hre.network.name} blockchain`
      );
    }
  );
