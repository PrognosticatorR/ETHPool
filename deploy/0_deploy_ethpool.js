const getGasPrice = require("../scripts/estimateGasPrice");
const deployment = async (hre) => {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();
  const gasPrice = await getGasPrice();
  console.log(gasPrice);
  if (hre.network.name === "development" || hre.network.name === "testnet") {
    return deploy("ETHPool", {
      from: deployer,
      log: true,
      gasPrice: gasPrice,
      gasLimit: 6721975,
    });
  }
};

deployment.tags = ["ETHPool", "development"];
module.exports = deployment;
