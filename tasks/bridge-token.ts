import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "../helpers/utils";
import { Wallet, JsonRpcProvider } from "ethers";
import {
  BackedCCIPReceiver__factory,
  BackedCCIPReceiver,
  ERC20__factory,
} from "../typechain-types";
import { Spinner } from "../helpers/spinner";
import { BACKED_CCIP_RECEIVER } from "../helpers/constants";

task(
  `bridge-token`,
  `Bridge token with BackedCCIPReceiver smart contract`
)
  .addParam(`destinationChainSelector`, `The selector of the destination chain`)
  .addParam(`token`, `The address of the token`)
  .addParam(`amount`, `Amount to be bridged`)
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const destinationChainSelector = taskArguments.destinationChainSelector
      const token = taskArguments.token
      let amount = taskArguments.amount
      amount = hre.ethers.parseUnits(amount, 18);

      const privateKey = getPrivateKey();
      const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

      const provider = new JsonRpcProvider(rpcProviderUrl);
      const wallet = new Wallet(privateKey);
      const deployer = wallet.connect(provider);

      const spinner: Spinner = new Spinner();

      console.log(
        `ℹ️  Attempting to bridge token ${token} with BackedCCIPReceiver on the ${hre.network.name} blockchain to ${destinationChainSelector}.`
      );
      spinner.start();

      const contract = BackedCCIPReceiver__factory.connect(BACKED_CCIP_RECEIVER[hre.network.name], deployer) as BackedCCIPReceiver;
      const erc20 = ERC20__factory.connect(token, deployer);

      let tx = await erc20.approve(BACKED_CCIP_RECEIVER[hre.network.name], amount);
      await tx.wait();

      const fees = await contract.getDeliveryFeeCost(destinationChainSelector, wallet.address, token, amount);

      tx = await contract.send(destinationChainSelector, wallet.address, token, amount, { value: fees });
      await tx.wait();

      spinner.stop();
      console.log(
        `✅ Token ${token} bridged with BackedReceiverCCIP on ${hre.network.name} blockchain to ${destinationChainSelector}`
      );
    }
  );
