const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('VaultToken contract', () => {
    let VaultToken, TestToken, vaultToken, testToken, manager, depositor, fake_controller, fake_airswap, fake_uniswap;

    before(async () => {
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
            const vaultTokenConnectedToManager = await vaultToken.connect(manager);
            const testTokenConnectedToManager = await testToken.connect(manager);

            await testTokenConnectedToManager.approve(vaultToken.address, 1e6);
            await vaultTokenConnectedToManager.initializeRatio(ethers.utils.parseUnits('1', 18));

            const vaultTokenSupply = await vaultToken.totalSupply();
            const vaultBalance = await testToken.balanceOf(vaultToken.address);

            expect(vaultTokenSupply).to.equal(ethers.utils.parseUnits('1', 18));
            expect(vaultBalance).to.equal(1e6);
        });
    });

});