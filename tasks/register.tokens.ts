import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { BACKED_CCIP_RECEIVER, BACKED_TOKENS } from "../helpers/constants";

task(
  `register-tokens`,
  `Registers tokens in BackedCCIPReceiver smart contract`
)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      for (let token of BACKED_TOKENS) {
        const deployment = token.deployments.find(d => d.chainId === hre.network.config.chainId!);
        if (!deployment) {
          console.log(`🚨 Skipping deployment ${token.name} on ${hre.network.name} as it is not deployed on this network.`);
        }

        console.log(
          `ℹ️  Attempting to register token ${token.name} (variant: ${token.variant}) in BackedCCIPReceiver on the ${hre.network.name} blockchain using tokenId: ${token.productId}`
        );
        spinner.start();

        const factory: BackedCCIPReceiver__factory =
          (await hre.ethers.getContractFactory(
            "BackedCCIPReceiver"
          )) as BackedCCIPReceiver__factory;

        const contract = factory.attach(BACKED_CCIP_RECEIVER[hre.network.name]) as BackedCCIPReceiver;

        await contract.registerToken(deployment!.address, token.productId, token.variant);

        console.log(
          `✅ Token ${token} registered in BackedReceiverCCIP at tokenId: ${token.productId} on ${hre.network.name} blockchain`
        );
      }

      spinner.stop();
    }
  );
