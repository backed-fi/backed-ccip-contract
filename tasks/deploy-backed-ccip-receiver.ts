import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl, getRouterConfig } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { CUSTODY_ADDRESS } from "../helpers/constants";

task(
  `deploy-backed-ccip-receiver`,
  `Deploys the BackedCCIPReceiver smart contract`
)
  .addOptionalParam(`router`, `The address of the Router contract`)
  .addOptionalParam(`custodyWallet`, `The address of the custody wallet`)
  .addOptionalParam(`gasLimit`, `Initial value for default CCIP execution gas limit on destination chain`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const routerAddress = taskArguments.router
        ? taskArguments.router
        : getRouterConfig(hre.network.name).address;
      const custodyWallet = taskArguments.custodyWallet
        ? taskArguments.custodyWallet
        : CUSTODY_ADDRESS[hre.network.name];
      const gasLimit = taskArguments.gasLimit
        ? taskArguments.gasLimit
        : 200_000;

      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to deploy BackedCCIPReceiver on the ${hre.network.name} blockchain using ${deployer.address} address, with the Router address ${routerAddress} provided as constructor argument`
      );
      spinner.start();

      const factory: BackedCCIPReceiver__factory =
        (await hre.ethers.getContractFactory(
          "BackedCCIPReceiver"
        )) as BackedCCIPReceiver__factory;

      const proxy =
        await hre.upgrades.deployProxy(factory, [routerAddress, custodyWallet, gasLimit]) as unknown as BackedCCIPReceiver;
      await proxy.waitForDeployment();

      const proxyAddress =
        await proxy.getAddress();

      await hre.run("verify:verify", {
        address: proxyAddress,
      });

      spinner.stop();
      console.log(
        `✅ BackedReceiverCCIP proxy deployed at address ${proxyAddress} on ${hre.network.name} blockchain`
      );
    }
  );
