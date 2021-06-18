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
  }
  // return the manager address

  async getManager() {
    return this.vt.methods.manager().call();
  }

  setManager(a) {
    this.manager = a;
  }

  async symbol() {
    return this.vt.methods.symbol().call();
  }

  // asset is the contract address of an ERC20 token that can be used to buy or sell this vault token

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
    console.log("amt  " + amount);
    // this.assetObject.approve(this.address, amount, f).then((result) => {
    //   console.log("approve result +");
    //   console.log(result);
    // });

    return this.vt.methods["deposit"](amount).send({ from: f });
  }

  withdraw(amount, f) {
    this.assetObject.approve(this.address, amount, f).then((result) => {
      console.log("approve result +");
      console.log(result);
    });
    return this.vt.methods["withdraw"](amount).send({ from: f });
  }

  setVaultBalance(amount) {
    this.vaultBalance = parseInt(amount);
  }

  initialize1(amount, f) {
    this.assetObject.approve(this.address, amount, f).then((result) => {
      console.log("approve result +");
      console.log(result);
    });
    return this.vt.methods["initializeRatio"](amount).send({ from: f });
  }

  approveAsset(amount, f) {
    return this.assetObject.approve(this.address, amount, f);
  }
  initialize(amount, f) {
    return this.vt.methods["initializeRatio"](amount).send({ from: f });
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

  writeCalls(amount, otAddress, mpAddress, f) {
    return this.vt.methods["writeCalls"](amount, otAddress, mpAddress).send({
      from: f,
    });
  }

  sellCalls(amount, premiumAmount, otherPartyAddress, f) {
    return this.vt.methods["sellCalls"](
      amount,
      premiumAmount,
      otherPartyAddress
    ).send({ from: f });
  }

  async symbol1() {
    let symbol = "";
    await this.vt.methods.symbol().call(function (error, result) {
      console.log(result);
      symbol = result;
    });
    return symbol;
  }

  async getAsset1(f) {
    let asset = "";
    await this.vt.methods.asset().call({ from: f }, function (error, result) {
      asset = result;
    });
    return asset;
  }
}
