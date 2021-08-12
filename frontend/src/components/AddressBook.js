import { nwConfig, currentChain } from "./NetworkConfig";
const addressabi = require("../abi/ab.json");

export class AddressBook {
  constructor(web3) {
    this.provider = web3;
    const AddressBookAddr = nwConfig[currentChain].addressBookAddr;
    this.address = AddressBookAddr;
    this.addressBook = new web3.eth.Contract(addressabi, AddressBookAddr);
    this.marginPoolAddress = "";
  }

  async getMarginPool() {
    let mpAddr = "";
    await this.addressBook.methods
      .getMarginPool()
      .call(function (error, result) {
        mpAddr = result;
      });
    return mpAddr;
  }
  setMarginPool(m) {
    this.marginPoolAddress = m;
  }
}
