const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe('VaultToken contract (full test)', () => {
    let VaultToken, TestToken, OtokenFactory, Otoken, Whitelist, Oracle, MarginPool, MarginCalculator, AddressBook, Controller, MarginVault;
    let vaultToken, mockUSDC, mockWETH, mockOtoken, mockOtokenAddr, otokenFactory, otokenImpl, whitelist, oracle, marginPool, marginCalculator, addressBook, controller, marginVault;
    let manager, depositor, deployer, pricer;

    before(async () => {
        console.log("IMPORTANT: SimpleVaultToken.js has extensive testing on the deposit/withdraw functions");

        VaultToken = await ethers.getContractFactory('VaultToken');
        TestToken = await ethers.getContractFactory('TestToken');
        OtokenFactory = await ethers.getContractFactory('OtokenFactory');
        Otoken = await ethers.getContractFactory('Otoken');
        Whitelist = await ethers.getContractFactory('Whitelist');
        Oracle = await ethers.getContractFactory('Oracle');
        MarginPool = await ethers.getContractFactory('MarginPool');
        MarginCalculator = await ethers.getContractFactory('MarginCalculator');
        MarginVault = await ethers.getContractFactory('MarginVault');
        AddressBook = await ethers.getContractFactory('AddressBook');

        [manager, depositor, deployer, pricer, fake_multisig, fake_airswap, fake_uniswap] = await ethers.getSigners();

        // Deploy all the addresses
        addressBook = await AddressBook.connect(deployer).deploy();
        otokenFactory = await OtokenFactory.connect(deployer).deploy(addressBook.address);
        otokenImpl = await Otoken.connect(deployer).deploy();
        whitelist = await Whitelist.connect(deployer).deploy(addressBook.address);
        oracle = await Oracle.connect(deployer).deploy();
        marginPool = await MarginPool.connect(deployer).deploy(addressBook.address);
        marginCalculator = await MarginCalculator.connect(deployer).deploy(oracle.address);
        marginVault = await MarginVault.connect(deployer).deploy();

        Controller = await ethers.getContractFactory(
            'Controller',
            {
                libraries: {
                    MarginVault: marginVault.address
                }
            }
        );

        controller = await Controller.connect(deployer).deploy();

        // Assign the addresses in the AddressBook
        await addressBook.connect(deployer).setOtokenFactory(otokenFactory.address);
        await addressBook.connect(deployer).setOtokenImpl(otokenImpl.address);
        await addressBook.connect(deployer).setWhitelist(whitelist.address);
        await addressBook.connect(deployer).setOracle(oracle.address);
        await addressBook.connect(deployer).setMarginPool(marginPool.address);
        await addressBook.connect(deployer).setMarginCalculator(marginCalculator.address);
        await addressBook.connect(deployer).setController(controller.address);

        // Transfer ownership
        await addressBook.connect(deployer).transferOwnership(fake_multisig.address);
        await whitelist.connect(deployer).transferOwnership(fake_multisig.address);
        await oracle.connect(deployer).transferOwnership(fake_multisig.address);
        await marginPool.connect(deployer).transferOwnership(fake_multisig.address);

        // Prepare the mock USDC (strike) token, mock WETH (asset) token and vault token
        mockUSDC = await TestToken.connect(depositor).deploy(
            "Mock USDC",
            "USDC",
            6,
            100000e6
        );
        mockWETH = await TestToken.connect(depositor).deploy(
            "Mock WETH",
            "WETH",
            18,
            ethers.utils.parseUnits('100', 18)  
        );
        vaultToken = await VaultToken.connect(manager).deploy(
            "Vault", 
            "VAULT", 
            await addressBook.getController(), 
            fake_airswap.address, 
            fake_uniswap.address, 
            mockWETH.address, 
            manager.address
        );

        // Prepare the oracle
        await oracle.connect(fake_multisig).setAssetPricer(mockWETH.address, pricer.address);
        //await oracle.connect(fake_multisig).setAssetPricer(mockUSDC.address, pricer.address);
        await oracle.connect(fake_multisig).setStablePrice(mockUSDC.address, 1e6)

        // Prepare the whitelist
        await whitelist.connect(fake_multisig).whitelistCollateral(mockWETH.address);
        await whitelist.connect(fake_multisig).whitelistProduct(
            mockWETH.address,
            mockUSDC.address,
            mockWETH.address,
            false
        );

        // Prepare the oToken
        mockOtokenTransaction = await otokenFactory.connect(fake_multisig).createOtoken(
            mockWETH.address,
            mockUSDC.address,
            mockWETH.address,
            ethers.utils.parseUnits('1000', 18),
            1640937600, // 2021 Dec. 31 @ 8 UTC
            false
        );

        const mockOtokenReceipt = await mockOtokenTransaction.wait();
        mockOtokenAddr = mockOtokenReceipt.events[1].args[0];

        mockOtoken = await ethers.getContractAt(
            'Otoken',
            mockOtokenAddr,
            fake_multisig
        );
    });

    describe("Verify Depositor's Balance", () => {
        it('Depositor should own the WETH supply', async () => {
            const depositorBalance = await mockWETH.balanceOf(depositor.address);
            expect(await mockWETH.totalSupply()).to.equal(depositorBalance);
        });
        it('Depositor should give 0.01 WETH', async () => {
            await mockWETH.connect(depositor).transfer(manager.address, ethers.utils.parseUnits('0.01', 18));
            const managerBalance = await mockWETH.balanceOf(manager.address);
            expect(managerBalance).to.equal(ethers.utils.parseUnits('0.01', 18));
        });
    });

    describe("Initialize the Vault", () => {
        it('Ratio should be initialized', async () => {
            await mockWETH.connect(manager).approve(vaultToken.address, ethers.utils.parseUnits('0.01', 18));
            await vaultToken.connect(manager).initializeRatio(ethers.utils.parseUnits('0.01', 18));

            const vaultTokenSupply = await vaultToken.totalSupply();
            const vaultBalance = await mockWETH.balanceOf(vaultToken.address);

            expect(vaultTokenSupply).to.equal(ethers.utils.parseUnits('0.01', 18));
            expect(vaultBalance).to.equal(ethers.utils.parseUnits('0.01', 18));
        });
    });

    describe("Deposit into the vault", () => {
        it('Should give the depositor 10e18 vault tokens for 10e18 WETH', async () => {
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('10', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('10', 18));

            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('10.01', 18));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('10.01', 18));
        });
    });

    describe("Fail to write options during the withdrawal window", () => {
        it('Should revert on attempting to write options', async () => {
            await expect(
                vaultToken.connect(manager).writeCalls(
                    ethers.utils.parseUnits('10.01', 18),
                    mockOtokenAddr,
                    marginPool.address
                )
            ).to.be.reverted;
        });
    });

    describe("Interact after the withdrawal window closes", () => {
        before(async () => {
            await network.provider.send('evm_increaseTime', [86400]);
        });
        it('Should write calls when the withdrawal window is closed', async () => {
            await expect(
                vaultToken.connect(manager).writeCalls(
                    ethers.utils.parseUnits('10.01', 18),
                    mockOtokenAddr,
                    marginPool.address
                )
            ).to.not.be.reverted;
            expect(await mockOtoken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('10.01', 8));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(0);
        });
        it('Should allow you to deposit funds', async () => {
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));

            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('11', 18));
        });
        it('Should write calls again to the same vault', async () => {
            await vaultToken.connect(manager).writeCalls(
                ethers.utils.parseUnits('1', 18),
                mockOtokenAddr,
                marginPool.address
            );

            expect(await mockOtoken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('11.01', 8));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(0);
        });
    });

    describe("Fail to settle the vault", () => {
        before(async () => {
            await network.provider.send('evm_setNextBlockTimestamp', [1640937601]);
        });
        it('Should REVERT in an attempt to settle the vault', async () => {
            await expect(
                vaultToken.connect(manager).settleVault()
            ).to.be.revertedWith('Controller: asset prices not finalized yet');
        });
    });

    describe("Settle the vault", () => {
        before(async () => {
            await oracle.connect(pricer).setExpiryPrice(
                mockWETH.address,
                1640937600,
                999e8
            );
        });
        it('Should settle the vault', async () => {
            await vaultToken.connect(manager).settleVault();
        });
    });

});