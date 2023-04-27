import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as envConfig } from "dotenv";
envConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [`0x${process.env.SEPOLIA_PRIVATE_KEY}`] : [],
    },
    gnosis: {
      url: "https://rpc.gnosischain.com",
      accounts: process.env.GNOSIS_PRIVATE_KEY ? [`0x${process.env.GNOSIS_PRIVATE_KEY}`] : [],
    },
    chiado: {
      url: "https://rpc.chiadochain.net",
      gasPrice: 1000000000,
      accounts: process.env.CHIADO_PRIVATE_KEY ? [`0x${process.env.CHIADO_PRIVATE_KEY}`] : []
    },
  },
  etherscan: {
    customChains: [
      {
        network: "gnosis",
        chainId: 100,
        urls: {
          apiURL: "https://blockscout.com/xdai/mainnet/api",
          browserURL: "https://blockscout.com/xdai/mainnet",
        },
      },
      {
        network: "chiado",
        chainId: 10200,
        urls: {
          apiURL: "https://blockscout.com/gnosis/chiado/api",
          browserURL: "https://blockscout.com/gnosis/chiado",
        },
      },
    ],
    apiKey: {
      "sepolia": process.env.ETHERSCAN_API_KEY || "",
      "chiado": process.env.CHIADO_API_KEY || "",
      "gnosis": process.env.GNOSIS_API_KEY || "",
    },
  }
  
};

export default config;
