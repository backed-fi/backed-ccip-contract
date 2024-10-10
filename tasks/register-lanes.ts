import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl, getRouterConfig } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { BACKED_CCIP_RECEIVER } from "../helpers/constants";

const networks: string[] = [];

task(
  `register-lanes`,
  `Registers lanes in BackedCCIPReceiver smart contract`
)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const privateKey = getPrivateKey();

      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();
      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver",
          deployer
        )) as BackedCCIPReceiver__factory;

      const contract = factory.attach(BACKED_CCIP_RECEIVER[hre.network.name]) as BackedCCIPReceiver;
      spinner.start();

      console.log(
        `ℹ️ Attempting to register lanes for ${networks.join(' ')} in BackedCCIPReceiver on the ${hre.network.name}`
      );

      for (let network of networks) {
        const chainSelector = getRouterConfig(network).chainSelector;
        const backedReceiverAddress = BACKED_CCIP_RECEIVER[network];

        console.log(
          `ℹ️  Attempting to register receiver and sender at ${backedReceiverAddress} address in BackedCCIPReceiver on the ${hre.network.name} blockchain using destination chain ${network} with selector: ${chainSelector}`
        );
        await contract.registerDestinationChain(chainSelector, backedReceiverAddress);
        await contract.registerSourceChain(chainSelector, backedReceiverAddress);
        console.log(
          `✅ Receiver and sender at ${backedReceiverAddress} address registered in BackedReceiverCCIP at destination chain selector: ${chainSelector} on ${hre.network.name} blockchain`
        );
      }

      spinner.stop();
      console.log(
        `✅ Lanes for ${networks.join(" ")} has been succesfully registered in BackedCCIPReceiver on the ${hre.network.name}`
      );
    }
  );
