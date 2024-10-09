import {
  routerConfig,
} from "./constants";

export const getProviderRpcUrl = (network: string) => {
  let rpcUrl;

  switch (network) {
    case "mainnet":
      rpcUrl = process.env.ETHEREUM_MAINNET_RPC_URL;
      break;
    case "polygon":
      rpcUrl = process.env.POLYGON_MAINNET_RPC_URL;
      break;
    case "avalanche":
      rpcUrl = process.env.AVALANCHE_C_CHAIN_RPC_URL;
      break;
    case "gnosis":
      rpcUrl = process.env.GNOSIS_MAINNET_RPC_URL;
      break;

    case "ethereumSepolia":
      rpcUrl = process.env.ETHEREUM_SEPOLIA_RPC_URL;
      break;
    case "polygonAmoy":
      rpcUrl = process.env.POLYGON_AMOY_RPC_URL;
      break;
    case "optimismSepolia":
      rpcUrl = process.env.OPTIMISM_SEPOLIA_RPC_URL;
      break;
    case "arbitrumSepolia":
      rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
      break;
    case "avalancheFuji":
      rpcUrl = process.env.AVALANCHE_FUJI_RPC_URL;
      break;
    case "bnbChainTestnet":
      rpcUrl = process.env.BNB_CHAIN_TESTNET_RPC_URL;
      break;
    case "baseSepolia":
      rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
      break;
    case "kromaSepolia":
      rpcUrl = process.env.KROMA_SEPOLIA_RPC_URL;
      break;
    case "wemixTestnet":
      rpcUrl = process.env.WEMIX_TESTNET_RPC_URL;
      break;
    case "gnosisChiado":
      rpcUrl = process.env.GNOSIS_CHIADO_RPC_URL;
      break;
    case "celoAlfajores":
      rpcUrl = process.env.CELO_ALFAJORES_RPC_URL;
      break;
    case "metisSepolia":
      rpcUrl = process.env.METIS_SEPOLIA_RPC_URL;
      break;
    case "zksyncSepolia":
      rpcUrl = process.env.ZKSYNC_SEPOLIA_RPC_URL;
      break;
    default:
      throw new Error("Unknown network: " + network);
  }

  if (!rpcUrl)
    throw new Error(
      `rpcUrl empty for network ${network} - check your environment variables`
    );

  return rpcUrl;
};

export const getPrivateKey = () => {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey)
    throw new Error(
      "private key not provided - check your environment variables"
    );

  return privateKey;
};

export const getRouterConfig = (network: string) => {
  switch (network) {
    case "mainnet":
      return routerConfig.mainnet;
    case "polygon":
      return routerConfig.polygon;
    case "avalanche":
      return routerConfig.avalanche;
    case "gnosis":
      return routerConfig.gnosis;

    case "ethereumSepolia":
      return routerConfig.ethereumSepolia;
    case "polygonAmoy":
      return routerConfig.polygonAmoy;
    case "optimismSepolia":
      return routerConfig.optimismSepolia;
    case "arbitrumSepolia":
      return routerConfig.arbitrumSepolia;
    case "avalancheFuji":
      return routerConfig.avalancheFuji;
    case "bnbChainTestnet":
      return routerConfig.bnbChainTestnet;
    case "baseSepolia":
      return routerConfig.baseSepolia;
    case "kromaSepolia":
      return routerConfig.kromaSepolia;
    case "wemixTestnet":
      return routerConfig.wemixTestnet;
    case "gnosisChiado":
      return routerConfig.gnosisChiado;
    case "celoAlfajores":
      return routerConfig.celoAlfajores;
    case "metisSepolia":
      return routerConfig.metisSepolia;
    case "zksyncSepolia":
      return routerConfig.zksyncSepolia;
    default:
      throw new Error("Unknown network: " + network);
  }
};