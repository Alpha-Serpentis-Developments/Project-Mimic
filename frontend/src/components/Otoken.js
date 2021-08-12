import { ERC20 } from "./Erc20";
const oTokenabi = require("../abi/oTokenabi.json");

// create a oToken class and inherent ERC 20 class

export class Otoken extends ERC20 {
  constructor(web3, address) {
    super(web3, address);
    this.ot = new web3.eth.Contract(oTokenabi, address);
  }
}
