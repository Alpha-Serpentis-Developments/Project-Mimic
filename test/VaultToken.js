const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('VaultToken contract', () => {
    let VaultToken, TestToken, vaultToken, testToken, manager, depositor, fake_controller, fake_airswap, fake_uniswap;

    beforeEach(async () => {
        VaultToken = await ethers.getContractFactory('VaultToken');
        TestToken = await ethers.getContractFactory('TestToken');
        [manager, depositor, fake_controller, fake_airswap, fake_uniswap] = await ethers.getSigners();

        testToken = await TestToken.connect(depositor).deploy("Mock Asset", "MOCK", 100000e6);
        vaultToken = await VaultToken.connect(manager).deploy(
            "Vault", 
            "VAULT", 
            fake_controller.address, 
            fake_airswap.address, 
            fake_uniswap.address, 
            testToken.address, 
            manager.address
        );
    });

    describe("Verify Depositor's Balance", () => {
        it('Depositor should own the asset supply', async () => {
            const depositorBalance = await testToken.balanceOf(depositor.address);
            expect(await testToken.totalSupply()).to.equal(depositorBalance);
        });
        it('Depositor should give 1 MOCK', async () => {
            await testToken.connect(depositor).transfer(manager.address, 1e6);
            const managerBalance = await testToken.balanceOf(manager.address);
            expect(managerBalance).to.equal(1e6);
        });
    });

    describe("Initialize the Vault", () => {
        it('Ratio should be initialized', async () => {
            await testToken.connect(manager).approve(vaultToken.address, 1e6);

            const amount = ethers.utils.parseUnits('1', 18);
            (await vaultToken.connect(manager)).initializeRatio(amount);
            const vaultTokenSupply = await vaultToken.totalSupply();
            const vaultBalance = await testToken.balanceOf(vaultToken.address);

            expect(vaultTokenSupply).to.equal(amount);
            expect(vaultBalance).to.equal(1e6);
        });
    });

});