const hre = require("hardhat");
const { ethers } = hre;

const getContractBalance = async () => {
  console.log(process.env.HARDHAT_NETWORK);
  const ETHPool = await ethers.getContractAt(
    "ETHPool",
    "0x4963C540103B74a4EB897EB3050173D71E455Eef"
  );
  const contractBalance = await ETHPool.totalRewards();

  return contractBalance.toString();
};

getContractBalance()
  .then((res) => {
    console.log("Contract balance is: ", res);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
