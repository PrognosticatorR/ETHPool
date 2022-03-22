const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = ethers;
describe("ETHPool", function () {
  let accounts;
  let ethPool;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const ETHPool = await ethers.getContractFactory("ETHPool");
    ethPool = await ETHPool.deploy();
    await ethPool.deployed();
    await ethPool.addTeamMember(accounts[1].address);
    expect(ethPool.address).to.be.properAddress;
  });
  describe("test deposite", () => {
    it("Should allow deposit", async () => {
      const amount = utils.parseEther("1");
      const txn = {
        to: ethPool.address,
        value: amount,
      };
      await accounts[0].sendTransaction(txn);
      const totalDeposits = await ethPool.totalRewards();
      expect(totalDeposits).to.be.equal(amount);
    });
    it("Should allow deposit from multiple accounts", async () => {
      const amount = utils.parseEther("1");
      const txn = {
        to: ethPool.address,
        value: amount,
      };
      await accounts[0].sendTransaction(txn);
      const totalDeposits = await ethPool.totalRewards();
      expect(totalDeposits).to.be.equal(amount);
      await accounts[1].sendTransaction(txn);
      await accounts[2].sendTransaction(txn);
      const newTotalDeposits = await ethPool.totalRewards();
      expect(newTotalDeposits).to.be.equal(amount.mul(3));
    });
    it("Should allow multiple deposit from single accounts", async () => {
      const amount = utils.parseEther("1");
      const txn = {
        to: ethPool.address,
        value: amount,
      };
      await accounts[0].sendTransaction(txn);
      const totalDeposits = await ethPool.totalRewards();
      expect(totalDeposits).to.be.equal(amount);
      await accounts[0].sendTransaction(txn);
      await accounts[0].sendTransaction(txn);
      const newTotalDeposits = await ethPool.totalRewards();
      expect(newTotalDeposits).to.be.equal(amount.mul(3));
    });
  });
  describe("test withdraw", () => {
    it("Should withdraw only deposited amount while rewards are not being distributed", async () => {
      const initialBalance = await accounts[1].getBalance();
      const value = utils.parseEther("1");
      const txn = {
        to: ethPool.address,
        value,
      };
      await accounts[1].sendTransaction(txn);
      await ethPool.connect(accounts[1]).withdraw();
      const newBalance = await accounts[1].getBalance();
      expect(newBalance).to.be.within(
        initialBalance.sub(value),
        initialBalance
      );
    });
    it("Should not allow withdraw if amount is not deposited", async () => {
      try {
        await ethPool.connect(accounts[5]).withdraw();
      } catch (err) {
        expect(err.message).to.be.equal(
          "VM Exception while processing transaction: reverted with reason string 'No deposits found for withdraw'"
        );
      }
    });
  });
  describe("test distributing rewards", () => {
    it("Should not allow distribute rewards if pool is empty", async () => {
      const value = utils.parseEther("1");
      await expect(ethPool.connect(accounts[1]).distributeRewards({ value })).to
        .be.reverted;
    });
    it("Should allow teamMembers to distribute rewards", async () => {
      const balance1 = await accounts[1].getBalance();
      const balance2 = await accounts[2].getBalance();
      const fiveEthers = utils.parseEther("5");
      const tenEthers = utils.parseEther("10");
      const fifteenEthers = utils.parseEther("15");
      const twentyEthers = utils.parseEther("20");
      const thirtyEthers = utils.parseEther("30");

      await accounts[1].sendTransaction({
        to: ethPool.address,
        value: tenEthers,
      });
      await accounts[2].sendTransaction({
        to: ethPool.address,
        value: thirtyEthers,
      });

      await ethPool
        .connect(accounts[0])
        .distributeRewards({ value: twentyEthers });

      await ethPool.connect(accounts[1]).withdraw();
      await ethPool.connect(accounts[2]).withdraw();

      const newAccount1Balance = await accounts[1].getBalance();
      const newAccount2Balance = await accounts[2].getBalance();
      expect(newAccount1Balance).to.be.within(
        balance1,
        balance1.add(fiveEthers)
      );
      expect(newAccount2Balance).to.be.within(
        balance2,
        balance2.add(fifteenEthers)
      );
    });
    it("Should not allow if distributor is not a team member", async () => {
      const tenEthers = utils.parseEther("10");
      const twentyEthers = utils.parseEther("20");
      const thirtyEthers = utils.parseEther("30");

      await accounts[1].sendTransaction({
        to: ethPool.address,
        value: tenEthers,
      });
      await accounts[2].sendTransaction({
        to: ethPool.address,
        value: thirtyEthers,
      });

      await expect(
        ethPool.connect(accounts[2]).distributeRewards({ value: twentyEthers })
      ).to.be.reverted;
    });
    it("Should only distribute rewards for users in pool", async function () {
      const balance1 = await accounts[1].getBalance();
      const balance2 = await accounts[2].getBalance();

      const oneEther = utils.parseEther("1");
      const tenEthers = utils.parseEther("10");
      const twentyEthers = utils.parseEther("20");
      const thirtyEthers = utils.parseEther("30");

      await accounts[1].sendTransaction({
        to: ethPool.address,
        value: tenEthers,
      });
      await accounts[2].sendTransaction({
        to: ethPool.address,
        value: thirtyEthers,
      });

      await ethPool.connect(accounts[1]).withdraw();

      // it should only send rewards to addr2
      await ethPool
        .connect(accounts[0])
        .distributeRewards({ value: twentyEthers });

      await ethPool.connect(accounts[2]).withdraw();

      const newBalance1 = await accounts[1].getBalance();
      const newBalance2 = await accounts[2].getBalance();

      expect(newBalance1).to.be.within(balance1.sub(oneEther), balance1); // Original Balance - gas
      expect(newBalance2).to.be.within(balance2, balance2.add(twentyEthers)); // Original Balance + 200 ethers
    });

    it("Should distribute rewards to single user in pool", async function () {
      const balance1 = await accounts[1].getBalance();

      const tenEthers = utils.parseEther("10");
      const twentyEthers = utils.parseEther("20");
      const thirtyEthers = utils.parseEther("30");

      await accounts[1].sendTransaction({
        to: ethPool.address,
        value: tenEthers,
      });
      await accounts[1].sendTransaction({
        to: ethPool.address,
        value: thirtyEthers,
      });

      await ethPool
        .connect(accounts[0])
        .distributeRewards({ value: twentyEthers });

      await ethPool.connect(accounts[1]).withdraw();

      const newBalance1 = await accounts[1].getBalance();

      expect(newBalance1).to.be.within(balance1, balance1.add(twentyEthers)); // Original Balance + 20 ethers
    });

  });
  describe("test AccessControll", () => {
    it("Should addTeamMember", async () => {
      await ethPool.addTeamMember(accounts[1].address);
      const TEAM_MEMBER_ROLE = utils.keccak256(
        utils.toUtf8Bytes("TEAM_MEMBER_ROLE")
      );
      const isTeamMember = await ethPool.hasRole(
        TEAM_MEMBER_ROLE,
        accounts[1].address
      );
      expect(isTeamMember).to.be.true;
    });
    it("Should removeTeamMember", async () => {
      await ethPool.addTeamMember(accounts[1].address);
      const TEAM_MEMBER_ROLE = utils.keccak256(
        utils.toUtf8Bytes("TEAM_MEMBER_ROLE")
      );
      let isTeamMember = await ethPool.hasRole(
        TEAM_MEMBER_ROLE,
        accounts[1].address
      );
      expect(isTeamMember).to.be.true;
      await ethPool.removeTeamMember(accounts[1].address);
      isTeamMember = await ethPool.hasRole(
        TEAM_MEMBER_ROLE,
        accounts[1].address
      );
      expect(isTeamMember).to.be.false;
    });
  });
});
