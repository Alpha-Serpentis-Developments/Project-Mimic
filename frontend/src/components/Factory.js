import { nwConfig, currentChain } from "./NetworkConfig";

const abi = require("../abi/factoryabi.json");
// the kovan network
// const factoryContractAddr = "0xa7CD2F79F9aebc0E0fe9bd33Ebf3ce9bD1eBE20c";

// the ropsten network
// const factoryContractAddr = "0x7A6828eF4AB3Cb9c08c40D0a05ad2416C8335C5c";

export class Factory {
  constructor(web3) {
    this.provider = web3;
    let factoryContractAddr = nwConfig[currentChain].factoryAddress;
    this.address = factoryContractAddr;
    this.factory = new web3.eth.Contract(abi, factoryContractAddr);
  }

  // function deployNewVaultToken(string memory _name, string memory _symbol,
  // address _controller, address _asset, uint256 _maximumAssets) external {

  // add the 10e18 to the frontend
  deployNewVT(
    tokenName,
    tokenSymble,
    controllerAddr,
    assetTokenAddr,
    amount,
    f
  ) {
    return this.factory.methods["deployNewVaultToken"](
      tokenName,
      tokenSymble,
      controllerAddr,
      assetTokenAddr,
      amount
    ).send({ from: f });
  }
  findAllVT() {
    return this.factory.getPastEvents("NewVaultToken", {
      fromBlock: 0,
      toBlock: "latest",
    });
  }
}
// module.exports = Factory;
