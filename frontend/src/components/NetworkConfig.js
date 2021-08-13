export let nwConfig = {
  1: {
    name: "Ethereum",
    chainId: 1,
    color: "green",
    prefix: "https://etherscan.io/",
    factoryAddress: "0xe73aFc806411859D49977dbADe5c9328CD565Bcb",
    addressBookAddr: "0x1E31F2DCBad4dc572004Eae6355fB18F9615cBe4",
    controllerAddress: "0x4ccc2339F87F6c59c6893E1A678c2266cA58dC72",
    wethContractAddr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    aTokenAddrs: [
      {
        key: "1",
        text: "WBTC : 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        value: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      },
      {
        key: "2",
        text: "WETH : 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        value: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      },
    ],
  },
  42: {
    name: "Kovan",
    chainId: 42,
    color: "purple",
    prefix: "https://kovan.etherscan.io/",
    factoryAddress: "0x03b5a144a67198c26751cba726b03c116f41239d",
    addressBookAddr: "0x8812f219f507e8cfe9d2f1e790164714c5e06a73",
    controllerAddress: "0xdee7d0f8ccc0f7ac7e45af454e5e7ec1552e8e4e",
    wethContractAddr: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    aTokenAddrs: [
      {
        key: "1",
        text: "WBTC : 0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb",
        value: "0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb",
      },
      {
        key: "2",
        text: "WETH : 0xd0a1e359811322d97991e03f863a0c30c2cf029c",
        value: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
      },
    ],
  },
  3: {
    name: "Ropsten",
    chainId: 3,
    color: "pink",
    prefix: "https://ropsten.etherscan.io/",
    factoryAddress: "0x7a6828ef4ab3cb9c08c40d0a05ad2416c8335c5c",
    addressBookAddr: "0xE71417EEfC794C9B83Fc494861981721e26db0E9",
    controllerAddress: "0x7e9beaccdccee88558aaa2dc121e52ec6226864e",
    aTokenAddrs: [
      {
        key: "1",
        text: "WBTC : 0x89c7cf7452c475bd52a7e8f3f0b7fc222940fa84",
        value: "0x89c7cf7452c475bd52a7e8f3f0b7fc222940fa84",
      },
      {
        key: "2",
        text: "WETH : 0xf70949bc9b52deffcda63b0d15608d601e3a7c49",
        value: "0xf70949bc9b52deffcda63b0d15608d601e3a7c49",
      },
    ],
  },
};

export let currentChain = 42;

export function setChain(c) {
  currentChain = c;
}
