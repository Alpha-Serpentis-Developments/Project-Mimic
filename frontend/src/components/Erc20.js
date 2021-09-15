const abi = require("../abi/erc20abi.json");

// the parent class for all erc20 objects

export class ERC20 {
  constructor(web3, address) {
    this.address = address;
    this.tName = "";
    this.tSymbol = "";
    this.tDecimals = -1;
    this.myBalance = -1;
    this.totalSupply = -1;
    this.ercStatus = true;
    this.erc = new web3.eth.Contract(abi, address);
  }

  async getName(f) {
    if (!this.ercStatus) {
      return this.tName;
    }

    return this.erc.methods.name().call();
    // this.erc.methods.symbol().call(function (error, result) {
    //   this.tSymbol = result;
    // });
  }

  setName(n) {
    this.tName = n;
  }

  // return the token name
  name() {
    return this.tName;
  }

  async getSymbol() {
    if (!this.ercStatus) {
      return "No Symbol";
    }
    return this.erc.methods.symbol().call();
  }
  setSymbol(s) {
    this.tSymbol = s;
  }

  symbol() {
    return this.tSymbol;
  }
  async getDecimals() {
    if (!this.ercStatus) {
      return "No Decimal Available";
    }
    return this.erc.methods.decimals().call();
  }

  setDecimals(s) {
    this.tDecimals = s;
  }

  decimals() {
    return this.tDecimals;
  }

  async getBalance(addr) {
    if (!this.ercStatus) {
      return "-1";
    }
    let b = 0;
    await this.erc.methods
      .balanceOf(addr)
      .call({ from: addr }, function (error, result) {
        b = result;
      });
    return b;
  }
  setBalance(b) {
    this.myBalance = parseInt(b);
  }

  // totalSupply() {
  //   if (!this.ercStatus) {
  //     return "undefined";
  //   }
  //   this.erc.methods.totalSupply().call(function (error, result) {
  //     return result;
  //   });
  // }

  async updateTotalSupply() {
    if (!this.ercStatus) {
      return "undefined";
    }

    let s = 0;
    await this.erc.methods.totalSupply().call(function (error, result) {
      s = result;
    });
    return s;
  }
  setTotalSupply(s) {
    this.totalSupply = parseInt(s);
  }
  async approve2(c, a, f) {
    let r = await this.erc.methods
      .approve(c, a)
      .send({ from: f })
      .on("receipt", function (receipt) {
        console.log("approve receipt " + receipt);
      });
    return r;
  }
  approve(c, a, f) {
    return this.erc.methods.approve(c, a).send({ from: f });
  }
  async allowance(o, s) {
    let b;

    await this.erc.methods.allowance(o, s).call(function (error, result) {
      b = result;
    });
    return b;
  }
}
