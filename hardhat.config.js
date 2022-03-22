require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-contract-sizer");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

const secretDevelopment = require("./secret.development.json");
const secretTestnet = require("./secret.testnet.json");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: { mnemonic: secretDevelopment.mnemonic },
    },
    development: {
      accounts: { mnemonic: secretDevelopment.mnemonic },
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      timeout: 200000000,
    },
    testnet: {
      accounts: { mnemonic: secretTestnet.mnemonic },
      url: secretTestnet.nodeUrl,
      chainId: 4,
    },
  },
  mocha: {
    timeout: 300000,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      testnet: 0,
    },
  },
};
