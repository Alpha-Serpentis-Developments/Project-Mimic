import { ERC20 } from "./Erc20";
const oTokenabi = require("../abi/oTokenabi.json");

// create a oToken class and inherent ERC 20 class

export class Otoken extends ERC20 {
  constructor(web3, address) {
    super(web3, address);
    this.ot = new web3.eth.Contract(oTokenabi, address);
    this.isPut = false;
    this.strikePrice = -1;
    this.expiryTS = 0;
  }

  async getIsPut() {
    return this.ot.methods.isPut().call();
  }
  setIsPut(a) {
    this.isPut = a;
  }
  async getStrike() {
    return this.ot.methods.strikePrice().call();
  }

  setStrike(a) {
    this.strikePrice = a;
  }
  async getExpiryTS() {
    return this.ot.methods.expiryTimestamp().call();
  }

  setExpiryTS(a) {
    this.expiryTS = a;
  }
}
