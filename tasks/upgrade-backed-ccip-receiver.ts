import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { BACKED_CCIP_RECEIVER } from "../helpers/constants";

task(
  `upgrade-backed-ccip-receiver`,
  `Upgrades the BackedCCIPReceiver smart contract`
)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();
      const contractAddress = BACKED_CCIP_RECEIVER[hre.network.name]
      console.log(
        `ℹ️  Attempting to upgrade BackedCCIPReceiver ${contractAddress}on the ${hre.network.name}`
      );
      spinner.start();

      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver"
        )) as BackedCCIPReceiver__factory;

      const proxy = await hre.upgrades.upgradeProxy(contractAddress, factory);
      await proxy.waitForDeployment();
      const proxyAddress =
        await proxy.getAddress();

      spinner.stop();
      console.log(
        `✅ BackedReceiverCCIP proxy upgraded at address ${proxyAddress} on ${hre.network.name} blockchain`
      );
    }
  );
