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
    development: {
      accounts: { mnemonic: secretDevelopment.mnemonic },
      url: "http://localhost:8545",
      chainId: 1337,
      timeout: 200000000,
    },
    "testnet-eth": {
      accounts: { mnemonic: secretTestnet.mnemonic },
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
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
      mainnet: "0x3F231E09f6e4e97E8fEc2F1E507414460C866F23",
      "mainnet-eth": "0x3F231E09f6e4e97E8fEc2F1E507414460C866F23",
      "mainnet-matic": "0x3F231E09f6e4e97E8fEc2F1E507414460C866F23",
      testnet: 0,
    },
    signer: {
      default: 1, // here this will by default take the second account as feeCollector (so in the test this will be a different account than the deployer)
      mainnet: "0xD2E49cfd5c03a72a838a2fC6bB5f6b46927e731A",
      "mainnet-eth": "0xD2E49cfd5c03a72a838a2fC6bB5f6b46927e731A",
      "mainnet-matic": "0xD2E49cfd5c03a72a838a2fC6bB5f6b46927e731A",
      testnet: 1,
    },
  },
};
