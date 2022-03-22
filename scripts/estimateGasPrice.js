const hre = require("hardhat");

module.exports = async () => {
  const { ethers } = hre;

  const gasPrice = await ethers.provider.getGasPrice();
  // mul gas 1.1 to guarantee transaction get pick up
  return gasPrice.mul(11).div(10);
};
