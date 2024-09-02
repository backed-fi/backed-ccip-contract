import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "../helpers/utils";
import { JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";

task(`get-message`, `Gets BackedCCIPReceiver latest received message details`)
  .addParam(`receiverAddress`, `The BackedCCIPReceiver address`)
  .addParam(
    `blockchain`,
    `The name of the blockchain (for example ethereumSepolia)`
  )
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const { receiverAddress, blockchain } = taskArguments;

      const rpcProviderUrl = getProviderRpcUrl(blockchain);
      const provider = new JsonRpcProvider(rpcProviderUrl);

      const backedCCIPReceiver: BackedCCIPReceiver =
        BackedCCIPReceiver__factory.connect(receiverAddress, provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to get the latest received message details from the BackedCCIPReceiver smart contract (${receiverAddress}) on the ${blockchain} blockchain`
      );
      spinner.start();

      const latestMessageDetails =
        await backedCCIPReceiver.getLastReceivedMessageDetails();

      spinner.stop();
      console.log(`ℹ️ Latest Message Details:`);
      console.log(`- Message Id: ${latestMessageDetails[0]}`);
      console.log(`- Source Chain Selector: ${latestMessageDetails[1]}`);
      console.log(`- Sender: ${latestMessageDetails[2]}`);
      console.log(`- Token: ${latestMessageDetails[3]}`);
      console.log(`- Amount: ${latestMessageDetails[4]}`);
    }
  );
