const cabi = require("../abi/cabi.json");
const ControllerAddr = "0xdEE7D0f8CcC0f7AC7e45Af454e5e7ec1552E8e4e";

export class Controller {
  constructor(web3) {
    this.provider = web3;
    this.address = ControllerAddr;
    this.controller = new web3.eth.Contract(cabi, ControllerAddr);
    this.expired = new Object();
  }

  async hasExpired(a) {
    let isExpired = null;
    console.log("at controller");
    await this.controller.methods.hasExpired(a).call(function (error, result) {
      console.log(result);
      isExpired = result;
    });
    return isExpired;
  }
  setExpired(a, b) {
    this.expired[a] = b;
  }

  getExpired(a) {
    return this.expired[a];
  }
}
