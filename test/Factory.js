const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('TestToken contract', () => {
    let TestToken, Factory, testToken, factory, manager, depositor, fake_airswap, fake_controller, fake_uniswap;

    beforeEach(async () => {
        TestToken = await ethers.getContractFactory('TestToken');
        Factory = await ethers.getContractFactory('Factory');

        [deployer, manager, depositor, fake_airswap, fake_controller, fake_uniswap] = await ethers.getSigners();
        testToken = await TestToken.deploy("Asset Token", "ASSET", 100000e6);
        factory = await Factory.deploy(fake_airswap.address)
    });

    describe('Deploy Vault Tokens', () => {
        it('Should NOT deploy w/ zero address parameters', async () => {
            await expect(
                factory.connect(manager).deployNewVaultToken(
                    "Asset Vault",
                    "VAULT",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                )
            ).to.be.reverted;
        });

        it('Should successfully deploy', async () => {
            await expect(
                factory.connect(manager).deployNewVaultToken(
                    "Asset Vault",
                    "VAULT",
                    fake_controller.address,
                    fake_uniswap.address,
                    testToken.address
                )
            ).to.not.be.reverted;
        });
    });

});