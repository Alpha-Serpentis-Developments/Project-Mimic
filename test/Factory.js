const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('TestToken contract', () => {
    let TestToken, Factory, testToken, factory, deployer, manager, fake_controller, fake_airswap, fake_addressBook;

    beforeEach(async () => {
        TestToken = await ethers.getContractFactory('TestToken');
        Factory = await ethers.getContractFactory('contracts\\mimic\\Factory.sol:Factory');
        VaultToken = await ethers.getContractFactory('VaultToken');

        [deployer, manager, fake_airswap, fake_controller, fake_addressBook] = await ethers.getSigners();
        testToken = await TestToken.deploy("Asset Token", "ASSET", 6, 100000e6);
        vaultToken = await VaultToken.deploy();

        await vaultToken.connect(manager).initialize(
            "INIT",
            "INIT",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            0,
            0
        );

        factory = await Factory.deploy(
            fake_airswap.address,
            fake_addressBook.address,
            "0x0000000000000000000000000000000000000000",
            deployer.address,
            0,
            0,
            0
        );
    });

    describe('Deploy Vault Tokens', () => {
        it('Should revert for zero address implementation', async () => {
            await expect(
                factory.connect(manager).deployNewVaultToken(
                    "Test",
                    "TEST",
                    testToken.address,
                    86400, // 1 day
                    0
                )
            ).to.be.revertedWith("ZeroAddress()");
        });
        it('Should deploy successfully', async () => {
            await factory.connect(deployer).changeCurrentImplementation(vaultToken.address);

            await expect(
                factory.connect(manager).deployNewVaultToken(
                    "Test",
                    "TEST",
                    testToken.address,
                    86400, // 1 day
                    0
                )
            ).to.not.be.reverted;
        });
    });

});