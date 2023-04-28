import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const API_URL =
  "https://eth-sepolia.g.alchemy.com/v2/JoEz3uurKiF2F8eioQ_jGBq252Unre_P";
const PRIVATE_KEY =
  "c526f9861c76be08016760348f84fe6ea563b0639e76c56cac8e8f804e1b55a2";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: "U3S3I7QXHBV2VH9IJHFIBIUVZWT1KG1VHC",
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
  solidity: "0.8.18",
};

export default config;
