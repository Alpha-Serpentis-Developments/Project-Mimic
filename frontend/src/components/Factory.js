import { nwConfig, currentChain } from "./NetworkConfig";

const abi = require("../abi/factoryabi.json");

export class Factory {
  constructor(web3) {
    this.provider = web3;
    let factoryContractAddr = nwConfig[currentChain].factoryAddress;
    this.address = factoryContractAddr;
    this.factory = new web3.eth.Contract(abi, factoryContractAddr);
    this.depositFee = -1;
    this.withdrawalFee = -1;
    this.performanceFee = -1;
  }

  async updateInfo() {
    this.setDepositFee(await this.getDepositFee());
    this.setWithdrawalFee(await this.getWithdrawalFee());
    this.setPerformanceFee(await this.getPerformanceFee());
  }

  async getDepositFee() {
    return this.factory.methods.depositFee().call();
  }

  setDepositFee(a) {
    this.depositFee = a;
  }

  async getWithdrawalFee() {
    return this.factory.methods.withdrawalFee().call();
  }

  setWithdrawalFee(a) {
    this.withdrawalFee = a;
  }

  async getPerformanceFee() {
    return this.factory.methods.performanceFee().call();
  }

  setPerformanceFee(a) {
    this.performanceFee = a;
  }

  deployNewVT(
    tokenName,
    tokenSymble,
    assetTokenAddr,
    withdrawWindowLen,
    amount,
    f
  ) {
    return this.factory.methods["deployNewVaultToken"](
      tokenName,
      tokenSymble,
      assetTokenAddr,
      withdrawWindowLen,
      amount
    ).send({ from: f });
  }
  async findAllVT() {
    return this.factory.getPastEvents("NewVaultToken", {
      fromBlock: 0,
      toBlock: "latest",
    });
  }
}
