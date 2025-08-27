import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl, getRouterConfig } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { BACKED_CCIP_RECEIVER, CHAIN_DEFAULT_GAS, CHAIN_VARIANT, lanesConfig } from "../helpers/constants";


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
      const networks: string[] = lanesConfig[hre.network.name];

      console.log(
        `ℹ️ Attempting to register lanes for ${networks.join(' ')} in BackedCCIPReceiver on the ${hre.network.name}`
      );

      for (let network of networks) {
        const chainSelector = getRouterConfig(network).chainSelector;
        const backedReceiverAddress = BACKED_CCIP_RECEIVER[network];
        const chainVariant = CHAIN_VARIANT[network];
        const defaultGas = CHAIN_DEFAULT_GAS[network];
        
        if((await contract.allowlistedSourceChains(chainSelector)).toLowerCase() === backedReceiverAddress.toLowerCase()) {
          console.log(`🚨 Skipping registering network ${network} as it was already registered on this bridge`);
          continue;
        }

        console.log(
          `ℹ️  Attempting to register receiver and sender at ${backedReceiverAddress} address in BackedCCIPReceiver on the ${hre.network.name} blockchain using destination chain ${network} with selector: ${chainSelector}`
        );
        console.log(JSON.stringify(await Promise.all([
          contract.interface.encodeFunctionData('registerDestinationChain',[chainSelector, backedReceiverAddress, chainVariant, defaultGas]),
          contract.interface.encodeFunctionData('registerSourceChain',[chainSelector, backedReceiverAddress])
        ].map(async data => ({
          to: await contract.getAddress(),
          value: '0',
          data: data
        }))), null, 2))
        await (await contract.registerDestinationChain(chainSelector, '0x92b9865c8a6fea71902f8347014fecfbfd41f6d0fdb0f2310e3265cfc36ea5e8', chainVariant, defaultGas)).wait(2); //Allow for different address for source and destination
        await (await contract.registerSourceChain(chainSelector, backedReceiverAddress)).wait(2);
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
