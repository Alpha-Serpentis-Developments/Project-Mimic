import { ERC20 } from "./Erc20";

const vtabi = require("../abi/vtAbi.json");

// create a vault token class and inherent ERC 20 class

export class VaultToken extends ERC20 {
  constructor(web3, address) {
    super(web3, address);
    this.vt = new web3.eth.Contract(vtabi, address);
    this.manager = "";
    this.asset = "";
    this.status = false;
    this.vaultBalance = -1;
    // an erc20 object corresponding to my asset token
    this.assetObject = null;
    this.manageToken = false;
    this.expireTime = -1;
    this.collateralAmount = -1;
    this.oTokenAddr = "";
    this.oTokenObj = null;
    this.oTokenNames = [];
    this.nav = -1;
    this.yield = -1;
    this.twitterLink = "";
    this.twitterHandle = "";
    this.vtStrategy = "";
  }

  async getManager() {
    return this.vt.methods.manager().call();
  }

  setManager(a) {
    this.manager = a;
  }

  async getAsset() {
    return this.vt.methods.asset().call();
  }

  setAsset(a) {
    this.asset = a;
  }

  updateStatus() {
    if (
      this.manager !== "" &&
      this.tName !== "" &&
      this.myBalance !== -1 &&
      this.asset !== "" &&
      this.assetObject !== null
    ) {
      this.status = true;
    }
  }

  deposit(amount, f) {
    return this.vt.methods["deposit"](amount).send({ from: f });
  }

  withdraw(amount, f) {
    return this.vt.methods["withdraw"](amount).send({ from: f });
  }

  withdraw1(amount, f) {
    this.assetObject.approve(this.address, amount, f).then((result) => {
      console.log("approve result +");
      console.log(result);
    });
    return this.vt.methods["withdraw"](amount).send({ from: f });
  }

  setVaultBalance(amount) {
    this.vaultBalance = parseInt(amount);
  }

  approveAsset(amount, f) {
    return this.assetObject.approve(this.address, amount, f);
  }

  allowanceAsset(f) {
    return this.assetObject.allowance(f, this.address);
  }

  findWithdrawalWindowActivated() {
    return this.vt.getPastEvents("WithdrawalWindowActivated", {
      fromBlock: 0,
      toBlock: "latest",
    });
  }

  settleVault(f) {
    return this.vt.methods["settleVault"]().send({ from: f });
  }

  sell(amount, premiumAmount, otherPartyAddress, f) {
    return this.vt.methods["sellCalls"](
      amount,
      premiumAmount,
      otherPartyAddress
    ).send({ from: f });
  }

  findAllOT() {
    return this.VT.getPastEvents("CallsMinted", {
      fromBlock: 0,
      toBlock: "latest",
    });
  }

  getCA(w, address) {
    return w.eth.getStorageAt(address, 8);
  }
  setCA(a) {
    this.collateralAmount = a;
  }

  getOT(w, address) {
    return w.eth.getStorageAt(address, 11);
  }
  setOT(a) {
    this.oTokenAddr = a;
  }

  setNAV(amt) {
    this.nav = amt;
  }

  setYield(amt) {
    this.yield = amt;
  }

  findAllSellCalls() {
    return this.vt.getPastEvents("OptionsSold", {
      fromBlock: 0,
      toBlock: "latest",
    });
  }
  setAllOtokenName(array) {
    this.oTokenNames = array;
  }

  writeOptionsAmt(amount, otAddress, f) {
    return this.vt.methods["writeOptions"](amount, otAddress).send({
      from: f,
    });
  }
  writeOptionsPcent(pcent, otAddress, f) {
    return this.vt.methods["writeOptions"](pcent, otAddress).send({
      from: f,
    });
  }

  sellOptions(a, f) {
    return this.vt.methods["sellOptions"](a).send({ from: f });
  }
  writeAndSellOptionsAmt(amount, otAddress, a, f) {
    return this.vt.methods["writeAndSellOptions"](amount, otAddress, a).send({
      from: f,
    });
  }
  writeAndSellOptionsPcent(pcent, otAddress, a, f) {
    return this.vt.methods["writeAndSellOptions"](pcent, otAddress, a).send({
      from: f,
    });
  }

  adjustTheMaxAssets(v, f) {
    console.log(this.vt);
    return this.vt.methods["adjustTheMaximumAssets"](v).send({
      from: f,
    });
  }
  adjustDepositFee(pcent, f) {
    return this.vt.methods["adjustDepositFee"](pcent).send({
      from: f,
    });
  }
  adjustWithdrawalFee(pcent, f) {
    return this.vt.methods["adjustWithdrawalFee"](pcent).send({
      from: f,
    });
  }
}
