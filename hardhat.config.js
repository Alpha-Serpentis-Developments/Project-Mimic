/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-waffle');

const INFURA_URL = '';
const PRIVATE_KEY = '';

module.exports = {
  paths: {
    sources: "./contracts/mimic"
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
      } 
    ]
  }
};
