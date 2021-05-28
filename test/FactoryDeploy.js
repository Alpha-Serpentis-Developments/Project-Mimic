const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('TestToken contract', () => {
    let TestToken, Factory, testToken, factory, manager, depositor, fake_airswap, fake_controller, fake_uniswap;

    beforeEach(async () => {
        TestToken = await ethers.getContractFactory('TestToken');
        Factory = await ethers.getContractFactory('Factory');

        [deployer, manager, depositor, fake_airswap, fake_controller, fake_uniswap] = await ethers.getSigners();
        testToken = await TestToken.deploy("Asset Token", "ASSET", 100000e6);
        factory = await Factory.deploy(fake_airswap.address);
        await testToken.transfer(depositor.address, testToken.totalSupply());
    });

    describe('TestToken deployment', () => {
        it('Should give tokens to the depositor', async () => {
            const depositorBalance = await testToken.balanceOf(depositor.address);
            expect(await testToken.totalSupply()).to.equal(depositorBalance);
        });
    });

    describe('Deploy Factory with fake AirSwap parameter', () => {
        it('Should successfully deploy', async () => {
            const result = await factory.connect(manager.address).deployNewVaultToken(
                "Asset Vault",
                "VAULT",
                fake_controller.address,
                fake_airswap.address,
                testToken.address
            );
            expect(await result.address).to.equal(address(0));
        });
    });

});