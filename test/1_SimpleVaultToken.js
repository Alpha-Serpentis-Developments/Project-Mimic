const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('VaultToken contract (simple test)', () => {
    let VaultToken, TestToken, TestWaiver, Factory, vaultToken, pricer, testToken, mockOtokenAddr, controller, testWaiver, manager, depositor, fake_multisig, fake_addressBook, fake_airswap;

    let normalVaultToken;

    const abi = [
        "function writeOptions(uint256,address) external",
        "function writeOptions(uint16,address) external",
        "error Invalid()",
        "error NotEnoughFunds()",
        "error NotEnoughFunds_ReserveViolation()",
        "error oTokenNotCleared()",
        "error WithdrawalWindowActive()",
    ];

    before(async () => {
        TestToken = await ethers.getContractFactory('TestToken');
        TestWaiver = await ethers.getContractFactory('TestWaiver');
        Factory = await ethers.getContractFactory('Factory');
        VaultToken = await ethers.getContractFactory('VaultToken');
        [deployer, manager, depositor, fake_addressBook, fake_multisig, fake_airswap] = await ethers.getSigners();

        vaultToken = await VaultToken.deploy();

        await vaultToken.initialize(
            "INIT",
            "INIT",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            0,
            0
        );
        
        mockUSDC = await TestToken.connect(depositor).deploy(
            "Mock USDC",
            "USDC",
            6,
            100000e6
        );
        testToken = await TestToken.connect(depositor).deploy(
            "Mock Asset",
            "MOCK",
            6,
            100000e6
        );
        testWaiver = await TestWaiver.connect(manager).deploy();

        // Opyn stuff

        Factory = await ethers.getContractFactory('Factory');
        VaultToken = await ethers.getContractFactory("contracts\\mimic\\VaultToken.sol:VaultToken");
        TestToken = await ethers.getContractFactory('TestToken');
        OtokenFactory = await ethers.getContractFactory('OtokenFactory');
        Otoken = await ethers.getContractFactory('Otoken');
        Whitelist = await ethers.getContractFactory('Whitelist');
        Oracle = await ethers.getContractFactory('Oracle');
        MarginPool = await ethers.getContractFactory('MarginPool');
        MarginCalculator = await ethers.getContractFactory('MarginCalculator');
        MarginVault = await ethers.getContractFactory('MarginVault');
        AddressBook = await ethers.getContractFactory('AddressBook');
        Pricer = await ethers.getContractFactory('TestPricer');

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

        controller = await controller.attach(await addressBook.getController());

        // Transfer ownership
        await addressBook.connect(deployer).transferOwnership(fake_multisig.address);
        await whitelist.connect(deployer).transferOwnership(fake_multisig.address);
        await oracle.connect(deployer).transferOwnership(fake_multisig.address);
        await marginPool.connect(deployer).transferOwnership(fake_multisig.address);
        await controller.connect(deployer).transferOwnership(fake_multisig.address);

        // Prepare pricer
        pricer = await Pricer.connect(deployer).deploy(addressBook.getOracle(), testToken.address);

        // Prepare the oracle
        await oracle.connect(fake_multisig).setAssetPricer(testToken.address, pricer.address);
        //await oracle.connect(fake_multisig).setAssetPricer(mockUSDC.address, pricer.address);
        await oracle.connect(fake_multisig).setStablePrice(mockUSDC.address, 1e6)

        // Prepare the whitelist
        await whitelist.connect(fake_multisig).whitelistCollateral(testToken.address);
        await whitelist.connect(fake_multisig).whitelistCollateral(mockUSDC.address);
        await whitelist.connect(fake_multisig).whitelistProduct(
            testToken.address,
            mockUSDC.address,
            testToken.address,
            false
        );

        await whitelist.connect(fake_multisig).whitelistProduct(
            testToken.address,
            mockUSDC.address,
            mockUSDC.address,
            true
        );

        // Prepare the oToken
        mockOtokenTransaction = await otokenFactory.connect(fake_multisig).createOtoken(
            testToken.address,
            mockUSDC.address,
            testToken.address,
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

        factory = await Factory.connect(deployer).deploy(
            fake_airswap.address,
            addressBook.address,
            vaultToken.address,
            deployer.address,
            0,
            0,
            0
        );

        vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
            "Vault",
            "VAULT",
            testToken.address,
            86400, // 1 day
            500e6
        );

        const receipt = await vaultTokenTransaction.wait();

        vaultToken = await ethers.getContractAt(
            'VaultToken',
            receipt.events[0].args.vaultToken,
            manager
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
        it('Depositor should have one waiver of ID 0', async () => {
            await testWaiver.connect(manager).mint(depositor.address, 0);
            expect(await testWaiver.balanceOf(depositor.address, 0)).to.equal(1);
        });
    });

    describe("Initialize the Vault", () => {
        it('Should revert for zero-value asset transfer (dust safety check)', async () => {
            await expect(
                vaultToken.connect(manager).deposit(1)
            ).to.be.reverted;
        });
        it('Ratio should be initialized', async () => {
            await testToken.connect(manager).approve(vaultToken.address, 1e6);
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('1', 6));

            const vaultTokenSupply = await vaultToken.totalSupply();
            const vaultBalance = await testToken.balanceOf(vaultToken.address);

            expect(vaultTokenSupply).to.equal(ethers.utils.parseUnits('1', 18));
            expect(vaultBalance).to.equal(1e6);
        });
    });

    describe("Depositor interaction (1:1 ratio)", () => {
        it('Should receive 1e18 vault tokens for 1e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 1e6);
            await vaultToken.connect(depositor).deposit(1e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(2e6);
        });
        it('Should receive 1e6 test tokens for burning 1e18 (withdrawal)', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1e6);
        });
        it('Should receive 100e18 vault tokens for 100e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 6));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('100', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('101', 6));
        });
        it('Should receive 100e6 test tokens for 100e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('100', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1e6);
        });
        it('Should receive 90e18 vault tokens for 100e6 test tokens (10% protocol deposit fee)', async () => {
            await factory.connect(deployer).changeDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 6));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('90', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('101', 6));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('10', 6));
        });
        it('Should receive 81e6 test tokens for 90e18 vault tokens (10% protocol withdrawal fee)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(1000);
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('90', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(20e6);
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('19', 6));
        });
        it('Should receive 1e18 vault tokens for 1e6 test tokens (10% vault deposit fee - 10% waiver)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(0);
            await factory.connect(deployer).changeDepositFee(0);
            await vaultToken.connect(manager).adjustDepositFee(1000);
            await vaultToken.connect(manager).adjustWaiver(testWaiver.address, 1, 0, 1000, 1000, 2, false);

            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 6));
            await vaultToken.connect(depositor).discountDeposit(ethers.utils.parseUnits('1', 6), testWaiver.address, 0);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 1e6 test tokens for 1e18 vault tokens (10% vault withdrawalFee - 10% waiver)', async () => {
            await vaultToken.connect(depositor).discountWithdraw(ethers.utils.parseUnits('1', 18), testWaiver.address, 0);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(20e6);
        });
        it('(BURN TEST) Successfully burn oTokens and redeem', async () => {
            const starting = await testToken.balanceOf(vaultToken.address);

            await vaultToken.connect(manager).adjustDepositFee(0);
            await vaultToken.connect(manager).adjustWithdrawalFee(0);

            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 6));

            await network.provider.send('evm_increaseTime', [86400]);
            await pricer.connect(manager).setTestPrice(ethers.utils.parseUnits('1000', 18));
            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint256,address)'](
                    ethers.utils.parseUnits('1', 6),
                    mockOtokenAddr
                )
            ).to.not.be.reverted;
            vaultToken = normalVaultToken;
            
            await vaultToken.connect(manager).burnOptions(ethers.utils.parseUnits('1', 8));
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));

            expect(await testToken.balanceOf(vaultToken.address)).to.be.equal(starting);
        });
    });

    describe("Depositor interaction (1:2 ratio)", () => {
        before(async () => {
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
            await vaultToken.connect(manager).adjustDepositFee(0);
            await vaultToken.connect(manager).adjustWithdrawalFee(0);
            await vaultToken.sendWithheldProtocolFees();
            await testToken.connect(depositor).rugPull(0.5e6, vaultToken.address);
        });
        it('Should receive 1e18 vault tokens for 0.5e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 0.5e6);
            await vaultToken.connect(depositor).deposit(0.5e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1e6);
        });
        it('Should receive 0.5e6 test tokens for 1e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));
            
            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(0.5e6);
        });
        it('Should receive 180e18 vault tokens for 100e6 test tokens (10% protocol deposit fee)', async () => {
            await factory.connect(deployer).changeDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 6));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('180', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('100.5', 6));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('10', 6));
        });
        it('Should receive 81e6 test tokens for 180e18 vault tokens (10% protocol withdrawal fee)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(1000);
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('180', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(19.5e6);
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('19', 6));
        });
    });

    describe("Depositor interaction (2:1 ratio)", () => {
        before(async () => {
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
            await vaultToken.sendWithheldProtocolFees();
            await testToken.connect(depositor).transfer(vaultToken.address, 1.5e6);
        });
        it('Should receive 0.5e18 vault tokens for 1e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 1e6);
            await vaultToken.connect(depositor).deposit(1e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('0.5', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(3e6);
        });
        it('Should receive 1e6 test tokens for 0.5e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('0.5', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(2e6);
        });
        it('Should receive 45e18 vault tokens for 100e6 test tokens (10% protocol deposit fee)', async () => {
            await factory.connect(deployer).changeDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 6));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('45', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('102', 6));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('10', 6));
        });
        it('Should receive 81e6 test tokens for 45e18 vault tokens (10% protocol withdrawal fee)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(1000);
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('45', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(21e6);
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('19', 6));
        });
        it('Should receive 1e18 vault tokens for 1e6 test tokens (10% vault deposit fee - 10% waiver)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(0);
            await factory.connect(deployer).changeDepositFee(0);
            await vaultToken.connect(manager).adjustDepositFee(1000);
            await vaultToken.connect(manager).adjustWaiver(testWaiver.address, 1, 0, 1000, 1000, 2, false);

            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('2', 6));
            await vaultToken.connect(depositor).discountDeposit(ethers.utils.parseUnits('2', 6), testWaiver.address, 0);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 1e6 test tokens for 1e18 vault tokens (10% vault withdrawalFee - 10% waiver)', async () => {
            await vaultToken.connect(depositor).discountWithdraw(ethers.utils.parseUnits('1', 18), testWaiver.address, 0);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(21e6);
        });
    });

    describe("Depositor interaction (1:4 ratio)", () => {
        before(async () => {
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
            await vaultToken.connect(manager).adjustDepositFee(0);
            await vaultToken.connect(manager).adjustWithdrawalFee(0);
            await vaultToken.sendWithheldProtocolFees();
            await testToken.connect(depositor).rugPull(1.75e6, vaultToken.address);
        });
        it('Should receive 4e18 vault tokens for 1e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 1e6);
            await vaultToken.connect(depositor).deposit(1e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('4', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1.25e6);
        });
        it('Should receive 1e6 test tokens for 4e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('4', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(0.25e6);
        });
        it('Should receive 360e18 vault tokens for 100e6 test tokens (10% protocol deposit fee)', async () => {
            await factory.connect(deployer).changeDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 6));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('360', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('100.25', 6));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('10', 6));
        });
        it('Should receive 81e6 test tokens for 360e18 vault tokens (10% protocol withdrawal fee)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(1000);
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('360', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(19.25e6);
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('19', 6));
        });
    });

    describe("Depositor interaction (20 decimal test token)", () => {
        before(async () => {
            testToken = await TestToken.connect(depositor).deploy(
                "Mock Asset",
                "MOCK",
                20,
                ethers.utils.parseUnits('100000', 20)
            );
            vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
                "Vault",
                "VAULT",
                testToken.address,
                86400, // 1 day
                ethers.utils.parseUnits('500', 20)
            );
    
            const receipt = await vaultTokenTransaction.wait();
    
            vaultToken = await ethers.getContractAt(
                'VaultToken',
                receipt.events[0].args.vaultToken,
                manager
            );

            await testToken.connect(depositor).transfer(manager.address, ethers.utils.parseUnits('1', 20));
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
        });

        it('Should initialize the vault correctly', async () => {
            await testToken.connect(manager).approve(vaultToken.address, ethers.utils.parseUnits('1', 20));
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('1', 20));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 20));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 1e18 vault tokens for 1e20 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 20));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 20));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('2', 20));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('2', 18));
        });
        it('Should receive 1e20 test tokens for 1e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 20));
        });
        it('Should receive 90e18 vault tokens for 100e20 test tokens (10% protocol deposit fee)', async () => {
            await factory.connect(deployer).changeDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 20));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 20));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('90', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('101', 20));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('10', 20));
        });
        it('Should receive 81e20 test tokens for 91e18 vault tokens (10% protocol withdrawal fee)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(1000);
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('90', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('20', 20));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('19', 20));
        });
    });

    describe("Depositor interaction (18 decimal test token)", () => {
        before(async () => {
            testToken = await TestToken.connect(depositor).deploy(
                "Mock Asset",
                "MOCK",
                18,
                ethers.utils.parseUnits('100000', 18)
            );
            vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
                "Vault",
                "VAULT",
                testToken.address,
                86400, // 1 day
                ethers.utils.parseUnits('500', 18)
            );
    
            const receipt = await vaultTokenTransaction.wait();
    
            vaultToken = await ethers.getContractAt(
                'VaultToken',
                receipt.events[0].args.vaultToken,
                manager
            );

            await testToken.connect(depositor).transfer(manager.address, ethers.utils.parseUnits('1', 18));
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
        });

        it('Should initialize the vault correctly', async () => {
            await testToken.connect(manager).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('1', 18));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 1e18 vault tokens for 1e18 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('2', 18));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('2', 18));
        });
        it('Should receive 1e18 test tokens for 1e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 90e18 vault tokens for 100e18 test tokens (10% protocol deposit fee)', async () => {
            await factory.connect(deployer).changeDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('90', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('101', 18));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('10', 18));
        });
        it('Should receive 81e6 test tokens for 90e18 vault tokens (10% protocol withdrawal fee)', async () => {
            await factory.connect(deployer).changeWithdrawalFee(1000);
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('90', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('20', 18));
            expect(await vaultToken.withheldProtocolFees()).to.equal(ethers.utils.parseUnits('19', 18));
        });
    });

    describe("ERC20/721 standard tests for waivers", () => { // previous tests were ERC1155
        before(async () => {
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
            await vaultToken.sendWithheldProtocolFees();

            testWaiver = await TestToken.connect(depositor).deploy(
                "ERC20 Test Waiver",
                "ERC20",
                8,
                1e8
            );

            await vaultToken.connect(manager).adjustWaiver(
                testWaiver.address,
                ethers.utils.parseUnits('1', 8),
                0,
                1000,
                1000,
                0,
                false
            );

        });
        it('Should receive 1e18 vault tokens for 1e6 test tokens (10% deposit fee - 10% waiver)', async () => {
            const vtBalOfDepositor = await vaultToken.balanceOf(depositor.address);
            const tokenBalOfVault = await testToken.balanceOf(vaultToken.address);

            await vaultToken.connect(manager).adjustDepositFee(1000);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor).discountDeposit(ethers.utils.parseUnits('1', 18), testWaiver.address, 0);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(vtBalOfDepositor.add(ethers.utils.parseUnits('1', 18)));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(tokenBalOfVault.add(ethers.utils.parseUnits('1', 18)));
        });
        it('Should receive 1e18 test tokens for 1e18 vault tokens (10% withdrawal fee - 10% waiver)', async () => {
            const vtBalOfDepositor = await vaultToken.balanceOf(depositor.address);
            const tokenBalOfVault = await testToken.balanceOf(vaultToken.address);

            await vaultToken.connect(manager).adjustWithdrawalFee(1000);
            await vaultToken.connect(depositor).discountWithdraw(ethers.utils.parseUnits('1', 18), testWaiver.address, 0);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(vtBalOfDepositor.sub(ethers.utils.parseUnits('1', 18)));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(tokenBalOfVault.sub(ethers.utils.parseUnits('1', 18)));
        });
    });

    describe("Pausable test", () => {
        before(async () => {
            await vaultToken.connect(manager).emergency(true);
        });
        it('Should not allow anything to occur', async () => {
            await expect(
                vaultToken.connect(depositor).deposit(1e6)
            ).to.be.revertedWith("ContractPaused()");
            await expect(
                vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18))
            ).to.be.revertedWith("ContractPaused()");
            await expect(
                vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18))
            ).to.be.revertedWith("ContractPaused()");
        });
        it('Should allow something to occur', async () => {
            await vaultToken.connect(manager).emergency(false);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            
            await expect(
                vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18))
            ).to.not.be.reverted;
        });
    });

});