
export type AddressMap = { [blockchain: string]: string };
export type TokenAmounts = { token: string, amount: string };
export type BackedTokenDeployment = { network: string, chainId: number, address: string };
export type BackedToken = { name: string, symbol: string, productId: number, decimals: number, variant: number, deployments: BackedTokenDeployment[] };

export const supportedNetworks = [
    `mainnet`,
    `polygon`,
    `avalanche`,
    `gnosis`,

    /// Testnets
    `ethereumSepolia`,
    `polygonAmoy`,
    `optimismSepolia`,
    `arbitrumSepolia`,
    `avalancheFuji`,
    `bnbChainTestnet`,
    `baseSepolia`,
    `kromaSepolia`,
    `wemixTestnet`,
    `gnosisChiado`,
    `celoAlfajores`,
    `metisSepolia`,
    `zksyncSepolia`
];

export const CUSTODY_ADDRESS: AddressMap = {
    [`localhost`]: `0x5f7a4c11bde4f218f0025ef444c369d838ffa2ad`,

    [`mainnet`]: `0x5f7a4c11bde4f218f0025ef444c369d838ffa2ad`,
    [`polygon`]: `0x5f7a4c11bde4f218f0025ef444c369d838ffa2ad`,
    [`avalanche`]: `0x5f7a4c11bde4f218f0025ef444c369d838ffa2ad`,
    [`gnosis`]: `0x5f7a4c11bde4f218f0025ef444c369d838ffa2ad`,

    /// Testnets
    [`ethereumSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`polygonAmoy`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`optimismSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`arbitrumSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`avalancheFuji`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`bnbChainTestnet`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`baseSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`kromaSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`wemixTestnet`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`gnosisChiado`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`celoAlfajores`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`metisSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`,
    [`zksyncSepolia`]: `0xcf8a9d1e489c58f4c3d69b45380fb4a6c03ada47`
};

export const BACKED_CCIP_RECEIVER: AddressMap = {
    [`localhost`]: `0xBCCb121bcC240DeF73C111211F18c23b81ff8b2E`,
    [`gnosis`]: `0xBCCb121bcC240DeF73C111211F18c23b81ff8b2E`,
    [`polygon`]: `0xBCCb121bcC240DeF73C111211F18c23b81ff8b2E`,
    [`mainnet`]: `0xBCCb121bcC240DeF73C111211F18c23b81ff8b2E`,
    [`avalanche`]: `0xBCCb121bcC240DeF73C111211F18c23b81ff8b2E`,

    [`ethereumSepolia`]: `0xb5C3Ebc3Ea9A32CF7F8901f9aBD4C2109B9BaE9c`,
    [`polygonAmoy`]: `0xC336D4732C9f9D29700D599DE89fdFBAe0569623`,
    [`arbitrumSepolia`]: `0x2b7eFF082f571f4DE1afC67ee707De065d7f2Bb6`,
    [`baseSepolia`]: `0xa337fa5D85e8850F31D0E6Ad5E02b0f55A8cDDCF`
}

export const BACKED_TOKENS: BackedToken[] = [
    {
        "name": "Backed GameStop Corp",
        "symbol": "bGME",
        "productId": 40254049,
        "decimals": 18,
        "variant": 1,
        "deployments": [
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0x7212088A11b4d8f6FC90fbB3dfE793B45dd72323"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0x7212088A11b4d8f6FC90fbB3dfE793B45dd72323"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0x7212088A11b4d8f6FC90fbB3dfE793B45dd72323"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0x7212088A11b4d8f6FC90fbB3dfE793B45dd72323"
            }
        ]
    },
    {
        "name": "Backed MicroStrategy Inc",
        "symbol": "bMSTR",
        "productId": 114333055,
        "decimals": 18,
        "variant": 1,
        "deployments": [
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0xaC28C9178ACc8BA4A11A29E013a3A2627086e422"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0xaC28C9178ACc8BA4A11A29E013a3A2627086e422"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0xaC28C9178ACc8BA4A11A29E013a3A2627086e422"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0xaC28C9178ACc8BA4A11A29E013a3A2627086e422"
            }
        ]
    },
    {
        "name": "Backed Alphabet Inc",
        "symbol": "bGOOGL",
        "productId": 114884328,
        "decimals": 18,
        "variant": 1,
        "deployments": [
            {

                "network": "Ethereum",
                "chainId": 1,
                "address": "0xEbee37Aaf2905b7BdA7E3b928043862e982E8F32"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0xEbee37Aaf2905b7BdA7E3b928043862e982E8F32"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0xEbee37Aaf2905b7BdA7E3b928043862e982E8F32"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0xEbee37Aaf2905b7BdA7E3b928043862e982E8F32"
            }
        ]
    },
    {
        "name": "Backed Coinbase Global",
        "symbol": "bCOIN",
        "productId": 124788928,
        "decimals": 18,
        "variant": 0,
        "deployments": [
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9"
            },
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9"
            },
            {
                "network": "Arbitrum",
                "chainId": 42161,
                "address": "0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9"
            },
            {
                "network": "Base",
                "chainId": 8453,
                "address": "0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9"
            }
        ]
    },
    {
        "name": "Backed CSPX Core S&P 500",
        "symbol": "bCSPX",
        "productId": 75820081,
        "decimals": 18,
        "variant": 0,
        "deployments": [
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"
            },
            {
                "network": "Arbitrum",
                "chainId": 42161,
                "address": "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59"
            },
            {
                "network": "Base",
                "chainId": 8453,
                "address": "0xc3ce78b037dda1b966d31ec7979d3f3a38571a8e"
            }
        ]
    },
    {
        "name": "Backed NVIDIA Corp",
        "symbol": "bNVDA",
        "productId": 144160308,
        "decimals": 18,
        "variant": 1,
        "deployments": [
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0xA34C5e0AbE843E10461E2C9586Ea03E55Dbcc495"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0xA34C5e0AbE843E10461E2C9586Ea03E55Dbcc495"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0xA34C5e0AbE843E10461E2C9586Ea03E55Dbcc495"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0xA34C5e0AbE843E10461E2C9586Ea03E55Dbcc495"
            }
        ]
    },
    {
        "name": "Backed Tesla Inc",
        "symbol": "bTSLA",
        "productId": 180149112,
        "decimals": 18,
        "variant": 1,
        "deployments": [
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0x14A5f2872396802C3Cc8942A39Ab3E4118EE5038"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0x14A5f2872396802C3Cc8942A39Ab3E4118EE5038"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0x14A5f2872396802C3Cc8942A39Ab3E4118EE5038"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0x14A5f2872396802C3Cc8942A39Ab3E4118EE5038"
            }
        ]
    },
    {
        "name": "Backed IB01 $ Treasury Bond 0-1yr",
        "symbol": "bIB01",
        "productId": 8492551,
        "decimals": 18,
        "variant": 0,
        "deployments": [
            {
                "network": "Arbitrum",
                "chainId": 42161,
                "address": "0xca30c93b02514f86d5c86a6e375e3a330b435fb5"
            },
            {
                "network": "Gnosis",
                "chainId": 100,
                "address": "0xca30c93b02514f86d5c86a6e375e3a330b435fb5"
            },
            {
                "network": "Polygon",
                "chainId": 137,
                "address": "0xca30c93b02514f86d5c86a6e375e3a330b435fb5"
            },
            {
                "network": "Ethereum",
                "chainId": 1,
                "address": "0xca30c93b02514f86d5c86a6e375e3a330b435fb5"
            },
            {
                "network": "Avalanche",
                "chainId": 43114,
                "address": "0xca30c93b02514f86d5c86a6e375e3a330b435fb5"
            },
            {
                "network": "Base",
                "chainId": 8453,
                "address": "0xca30c93b02514f86d5c86a6e375e3a330b435fb5"
            }
        ]
    }
]


export const routerConfig = {
    mainnet: {
        address: '0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D',
        chainSelector: '5009297550715157269',
    },
    polygon: {
        address: '0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe',
        chainSelector: '4051577828743386545',
    },
    avalanche: {
        address: '0xF4c7E640EdA248ef95972845a62bdC74237805dB',
        chainSelector: '6433500567565415381',
    },
    gnosis: {
        address: '0x4aAD6071085df840abD9Baf1697d5D5992bDadce',
        chainSelector: '465200170687744372',
    },

    /// Testnets
    ethereumSepolia: {
        address: `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59`,
        chainSelector: `16015286601757825753`,
    },
    polygonAmoy: {
        address: `0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2`,
        chainSelector: `16281711391670634445`,
    },
    optimismSepolia: {
        address: `0x114A20A10b43D4115e5aeef7345a1A71d2a60C57`,
        chainSelector: `5224473277236331295`,
    },
    avalancheFuji: {
        address: `0xF694E193200268f9a4868e4Aa017A0118C9a8177`,
        chainSelector: `14767482510784806043`,
    },
    arbitrumSepolia: {
        address: `0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165`,
        chainSelector: `3478487238524512106`,
    },
    bnbChainTestnet: {
        address: `0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f`,
        chainSelector: `13264668187771770619`,
    },
    baseSepolia: {
        address: `0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93`,
        chainSelector: `10344971235874465080`,
    },
    kromaSepolia: {
        address: `0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D`,
        chainSelector: `5990477251245693094`,
    },
    wemixTestnet: {
        address: `0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D`,
        chainSelector: `9284632837123596123`,
    },
    gnosisChiado: {
        address: `0x19b1bac554111517831ACadc0FD119D23Bb14391`,
        chainSelector: `8871595565390010547`,
    },
    celoAlfajores: {
        address: `0xb00E95b773528E2Ea724DB06B75113F239D15Dca`,
        chainSelector: `3552045678561919002`,
    },
    metisSepolia: {
        address: `0xaCdaBa07ECad81dc634458b98673931DD9d3Bc14`,
        chainSelector: `3777822886988675105`,
    },
    zksyncSepolia: {
        address: `0xA1fdA8aa9A8C4b945C45aD30647b01f07D7A0B16`,
        chainSelector: `6898391096552792247`,
    },
}
