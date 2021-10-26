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

  async defineSelf() {
    this.setStrike(await this.getStrike());
    this.setIsPut(await this.getIsPut());
    this.setExpiryTS(await this.getExpiryTS());
  }

  async getIsPut(blockNum) {
    if(blockNum === 0)
      return this.ot.methods.isPut().call();
    else
      return this.ot.methods.isPut().call(null, blockNum);
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
