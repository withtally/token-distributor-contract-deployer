
// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-etherscan");
// require("dotenv").config();

// requiring tasks.
import "tasks/deploy_token_distributor.ts";
import "tasks/merkle_tree_generation.ts";

import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import { vars } from "hardhat/config";
// import type { HardhatUserConfig } from "hardhat/config";
// import type { NetworkUserConfig } from "hardhat/types";

/* ========== DATA FROM .env ===========*/
// Private key
const PRIVATE_KEY: string = vars.get("PRIVATE_KEY") || '';

// Ethereum network nodes
const ETHEREUM_URL: string = vars.get("ETHEREUM_URL") || '';
const SEPOLIA_URL: string = vars.get("SEPOLIA_URL") || '';

// Polygon network nodes
const POLYGON_URL: string = vars.get("POLYGON_URL") || '';
const MUMBAI_URL: string = vars.get("MUMBAI_URL") || '';

// Optimism network nodes
const OPTIMISM_URL: string = vars.get("OPTIMISM_URL") || '';

// Arbitrum network nodes
const ARBITRUM_URL: string = vars.get("ARBITRUM_URL") || '';
const ARBITRUM_NOVA_URL: string = vars.get("ARBITRUM_NOVA_URL") || '';
const ARBITRUM_SEPOLIA_URL: string = vars.get("ARBITRUM_SEPOLIA_URL") || '';

// Etherscan key
const ETHERSCAN_KEY: string = vars.get("ETHERSCAN_API_KEY") || '';
const POLYGONSCAN_KEY: string = vars.get("POLYGONSCAN_KEY") || '';
const OPT_ETHERSCAN_KEY: string = vars.get("OPT_ETHERSCAN_KEY") || '';
const ARBISCAN_KEY: string = vars.get("ARBISCAN_KEY") || '';

const config: any = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_KEY,
      sepolia: ETHERSCAN_KEY,
      polygon: POLYGONSCAN_KEY,
      polygonMumbai: POLYGONSCAN_KEY,
      optimisticEthereum: OPT_ETHERSCAN_KEY,
      arbitrumOne: ARBISCAN_KEY,
      arbitrumSepolia: ARBISCAN_KEY,
    },
    customChains: [
      {
        network: "arbitrumGoerli",
        chainId: 421613,
        urls: {
          apiURL: "https://api-goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io"
        }
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io"
        }
      },
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io"
        }
      },
      {
        network: "base-goerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io"
        }
      },
      {
        network: "zkevm",
        chainId: 1101,
        urls: {
          apiURL:"https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com"
        }
      },
      {
        network: "scroll-alpha",
        chainId: 534353,
        urls: {
          apiURL: "https://blockscout.scroll.io/api",
          browserURL: "https://blockscout.scroll.io/"
        }
      }
    ]
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
      gas: 2100000,
      gasPrice: 8000000000,
    },
    ganache: {
      url: "http://localhost:7545",
      accounts: [PRIVATE_KEY],
    },
    ethereum: {
      url: ETHEREUM_URL,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      url: POLYGON_URL,
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: MUMBAI_URL,
      accounts: [PRIVATE_KEY],
    },
    optimism: {
      url: OPTIMISM_URL,
      accounts: [PRIVATE_KEY],
    },
    arbitrum: {
      url: ARBITRUM_URL,
      accounts: [PRIVATE_KEY],
    },
    arbitrumNova: {
      url: ARBITRUM_NOVA_URL,
      accounts: [PRIVATE_KEY],
    },
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
  }
};

export default config;
