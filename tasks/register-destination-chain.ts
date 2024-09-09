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
  `register-destination-chain`,
  `Registers destination chain in BackedCCIPReceiver smart contract`
)
  .addParam(`destinationChainSelector`, `Registered destination chain selector`)
  .addParam(`receiver`, `Registered receiver on the destination chain`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const destinationChainSelector = taskArguments.destinationChainSelector
      const receiver = taskArguments.receiver

      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to register receiver ${receiver} in BackedCCIPReceiver on the ${hre.network.name} blockchain using destination chain selector: ${destinationChainSelector} provided as constructor argument`
      );
      spinner.start();

      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver"
        )) as BackedCCIPReceiver__factory;

      const contract = factory.attach(BACKED_CCIP_RECEIVER[hre.network.name]) as BackedCCIPReceiver;

      await contract.registerDestinationChain(destinationChainSelector, receiver);

      spinner.stop();
      console.log(
        `✅ Receiver ${receiver} registered in BackedReceiverCCIP at destination chain: ${destinationChainSelector} on ${hre.network.name} blockchain`
      );
    }
  );
