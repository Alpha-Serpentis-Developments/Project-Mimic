/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");

const INFURA_URL = '';
const PRIVATE_KEY = '';

module.exports = {
  paths: {
    sources: "./contracts"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
  },
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 5000
      }
    },
    kovan: {
      url: "url here"
    },
    mainnet: {
      url: "url here"
    }
  },
  etherscan: {
    apiKey: "your key here"
  }
};
