const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe('VaultToken contract (full test)', () => {
    let Factory, VaultToken, TestToken, OtokenFactory, Otoken, Whitelist, Oracle, MarginPool, MarginCalculator, AddressBook, Controller, MarginVault;
    let factory, vaultToken, mockUSDC, mockWETH, mockOtoken, mockOtokenAddr, otokenFactory, otokenImpl, whitelist, oracle, marginPool, marginCalculator, addressBook, controller, marginVault;
    let manager, depositor, depositor_1, depositor_2, deployer, pricer;

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
        console.log("IMPORTANT: SimpleVaultToken.js has extensive testing on the deposit/withdraw functions");

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

        [manager, depositor, depositor_1, depositor_2, random_user, deployer, pricer, fake_multisig, fake_airswap] = await ethers.getSigners();

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
            ethers.utils.parseUnits('1000', 18)  
        );
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
            mockWETH.address,
            86400, // 1 day
            ethers.utils.parseUnits('100', 18)
        );

        const receipt = await vaultTokenTransaction.wait();

        vaultToken = await ethers.getContractAt(
            'VaultToken',
            receipt.events[0].args.vaultToken,
            manager
        );

        // Prepare the oracle
        await oracle.connect(fake_multisig).setAssetPricer(mockWETH.address, pricer.address);
        //await oracle.connect(fake_multisig).setAssetPricer(mockUSDC.address, pricer.address);
        await oracle.connect(fake_multisig).setStablePrice(mockUSDC.address, 1e6)

        // Prepare the whitelist
        await whitelist.connect(fake_multisig).whitelistCollateral(mockWETH.address);
        await whitelist.connect(fake_multisig).whitelistCollateral(mockUSDC.address);
        await whitelist.connect(fake_multisig).whitelistProduct(
            mockWETH.address,
            mockUSDC.address,
            mockWETH.address,
            false
        );

        await whitelist.connect(fake_multisig).whitelistProduct(
            mockWETH.address,
            mockUSDC.address,
            mockUSDC.address,
            true
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
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('0.01', 18));

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

    describe("Cap limits test", () => {
        before(async () => {
            await mockWETH.connect(depositor).transfer(depositor_1.address, ethers.utils.parseUnits('94.99', 18));
            await mockWETH.connect(depositor).transfer(depositor_2.address, ethers.utils.parseUnits('10', 18));
            await mockWETH.connect(depositor_1).approve(vaultToken.address, ethers.utils.parseUnits('94.99', 18));
            await mockWETH.connect(depositor_2).approve(vaultToken.address, ethers.utils.parseUnits('10', 18));
        });
        it('Should equal the cap limit and NOT revert', async () => {
            await expect(
                vaultToken.connect(depositor_1).deposit(ethers.utils.parseUnits('89.99', 18))
            ).to.not.be.reverted;
        });
        it('Should REVERT due to going above the cap limit', async () => {
            await expect(
                vaultToken.connect(depositor_2).deposit(ethers.utils.parseUnits('10', 18))
            ).to.be.reverted;
        });
        it('Should raise the cap and successfully let depositor_1 deposit', async () => {
            await vaultToken.connect(manager).adjustTheMaximumAssets(ethers.utils.parseUnits('105', 18));
            await vaultToken.connect(depositor_1).deposit(ethers.utils.parseUnits('5', 18));

            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('105', 18));
            expect(await vaultToken.balanceOf(depositor_1.address)).to.equal(ethers.utils.parseUnits('94.99', 18));
        });
        it('Should let depositor_2 in after depositor_1 left', async () => {
            await vaultToken.connect(depositor_1).withdraw(ethers.utils.parseUnits('5', 18));
            await vaultToken.connect(depositor_2).deposit(ethers.utils.parseUnits('5', 18));

            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('105', 18));
            expect(await vaultToken.balanceOf(depositor_2.address)).to.equal(ethers.utils.parseUnits('5', 18));
        });
    });

    describe("Fail to write options during the withdrawal window", () => {
        it('Should revert on attempting to write options', async () => {
            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint256,address)'](
                    ethers.utils.parseUnits('105', 18),
                    mockOtokenAddr
                )
            ).to.be.reverted;
            vaultToken = normalVaultToken;
        });
    });

    describe("Interact after the withdrawal window closes", () => {
        before(async () => {
            await vaultToken.connect(manager).adjustTheMaximumAssets(ethers.utils.parseUnits('110', 18));
            await network.provider.send('evm_increaseTime', [86400]);
        });
        it('Should write calls when the withdrawal window is closed', async () => {
            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint256,address)'](
                    ethers.utils.parseUnits('105', 18),
                    mockOtokenAddr
                )
            ).to.not.be.reverted;
            vaultToken = normalVaultToken;
            expect(await mockOtoken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('105', 8));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(0);
        });
        it('Should allow you to deposit funds', async () => {
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));

            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('11', 18));
        });
        it('Should write calls again to the same vault', async () => {
            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint256,address)'](
                    ethers.utils.parseUnits('1', 18),
                    mockOtokenAddr
                )
            ).to.not.be.reverted;
            vaultToken = normalVaultToken;

            expect(await mockOtoken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('106', 8));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(0);
        });
        it('Should REVERT for attempting to withdraw', async () => {
            await expect(
                vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18))
            ).to.be.reverted;
        });
        it('Should burn calls', async () => {
            await vaultToken.connect(manager).burnOptions(ethers.utils.parseUnits('1', 8));

            expect(await mockOtoken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('105', 8));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 18));
        });
    });

    describe("Withdrawal window reactivation", () => {
        it('Should allow a depositor to withdraw', async () => {
            await vaultToken.connect(manager).burnOptions(await mockOtoken.balanceOf(vaultToken.address));

            const priorBalance = await mockWETH.balanceOf(depositor.address);

            await expect(
                vaultToken.connect(depositor).withdraw(await vaultToken.balanceOf(depositor.address))
            ).to.not.be.reverted;
            
            expect(await mockWETH.balanceOf(depositor.address)).to.equal(priorBalance.add(ethers.utils.parseUnits('11', 18)));
        });
    });

    describe("Handle oTokens getting sent to the vault token directly", () => {
        before(async () => {
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('11', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('11', 18));

            await network.provider.send('evm_increaseTime', [86400]); // to resolve the earlier reopening of the vault

            await mockWETH.connect(depositor).transfer(random_user.address, ethers.utils.parseUnits('1', 18));
            await mockWETH.connect(random_user).approve(marginPool.address, ethers.utils.parseUnits('1', 18));
            const ActionType = {
                OpenVault: 0,
                MintShortOption: 1,
                BurnShortOption: 2,
                DepositLongOption: 3,
                WithdrawLongOption: 4,
                DepositCollateral: 5,
                WithdrawCollateral: 6,
                SettleVault: 7,
                Redeem: 8,
                Call: 9,
                Liquidate: 10
            };
            const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
            const args = [
                {
                    actionType: ActionType.OpenVault,
                    owner: random_user.address,
                    secondAddress: ZERO_ADDRESS,
                    asset: ZERO_ADDRESS,
                    vaultId: 1, // open the first vault
                    amount: 0,
                    index: 0,
                    data: ZERO_ADDRESS,
                },
                {
                    actionType: ActionType.DepositCollateral,
                    owner: random_user.address,
                    secondAddress: random_user.address,
                    asset: mockWETH.address,
                    vaultId: 1,
                    amount: ethers.utils.parseUnits('1', 18),
                    index: 0,
                    data: ZERO_ADDRESS
                },
                {
                    actionType: ActionType.MintShortOption,
                    owner: random_user.address,
                    secondAddress: random_user.address,
                    asset: mockOtoken.address,
                    vaultId: 1,
                    amount: ethers.utils.parseUnits('1', 8),
                    index: 0,
                    data: ZERO_ADDRESS
                }
            ];
            await controller.connect(random_user).operate(args);

            await mockOtoken.connect(random_user).transfer(vaultToken.address, ethers.utils.parseUnits('1', 8));
        });
        it('Ratio should not change for random oToken deposit', async () => {
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('107', 18));
        });
    });

    describe("Fail to settle the vault", () => {
        before(async () => {
            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint256,address)'](
                    ethers.utils.parseUnits('1', 18),
                    mockOtokenAddr
                )
            ).to.not.be.reverted;
            vaultToken = normalVaultToken;
            await network.provider.send('evm_setNextBlockTimestamp', [1640937601]);
        });
        it('Should REVERT in an attempt to settle the vault', async () => {
            await expect(
                vaultToken.connect(manager).settleVault()
            ).to.be.reverted;
            expect(await controller.isSettlementAllowed(mockOtoken.address)).to.be.equal(false); // Added due to a strange error occurring that Hardhat won't pick up?
        });
    });

    describe("Settle the vault (OTM)", () => {
        before(async () => {
            await oracle.connect(pricer).setExpiryPrice(
                mockWETH.address,
                1640937600,
                999e8
            );
        });
        it('Should settle the vault with no exercise', async () => {
            await vaultToken.connect(manager).settleVault();

            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('107', 18));
        });
        it('Should let people withdraw from the vault', async () => {
            const depBal = (await vaultToken.balanceOf(depositor.address)).add(await mockWETH.balanceOf(depositor.address));
            const depBal_1 = (await vaultToken.balanceOf(depositor_1.address)).add(await mockWETH.balanceOf(depositor_1.address));
            const depBal_2 = (await vaultToken.balanceOf(depositor_2.address)).add(await mockWETH.balanceOf(depositor_2.address));

            await vaultToken.connect(depositor).withdraw(await vaultToken.balanceOf(depositor.address));
            await vaultToken.connect(depositor_1).withdraw(await vaultToken.balanceOf(depositor_1.address));
            await vaultToken.connect(depositor_2).withdraw(await vaultToken.balanceOf(depositor_2.address));

            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('0.01', 18));
            expect(await mockWETH.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('0.01', 18));
            expect(await mockWETH.balanceOf(depositor.address)).to.equal(depBal);
            expect(await mockWETH.balanceOf(depositor_1.address)).to.equal(depBal_1);
            expect(await mockWETH.balanceOf(depositor_2.address)).to.equal(depBal_2);
        });
    });

    describe("Protocol Fee Test", () => {
        it('Take protocol fees for deposit', async () => {
            await factory.connect(deployer).changeDepositFee(100);
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));

            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal(ethers.utils.parseUnits('0.99', 18));
            expect(await mockWETH.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('0.01', 18));
        });
        it('Take protocol fees for withdrawing', async () => {
            const prevBal = await mockWETH.balanceOf(depositor.address);
            const adminBal = await mockWETH.balanceOf(deployer.address);
            await factory.connect(deployer).changeWithdrawalFee(100);
            
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('0.99', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal(0);
            expect(await mockWETH.balanceOf(deployer.address)).to.be.equal((ethers.utils.parseUnits('0.0099', 18)).add(adminBal));
            expect(await mockWETH.balanceOf(depositor.address)).to.be.equal((ethers.utils.parseUnits('0.9801', 18)).add(prevBal));
        });
        it('Verify ratio is still 1:1', async () => {
            const prevBal_0 = await vaultToken.balanceOf(depositor.address);
            const prevBal_1 = await vaultToken.balanceOf(depositor_1.address);

            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await mockWETH.connect(depositor_1).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));

            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor_1).deposit(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal((ethers.utils.parseUnits('0.99', 18)).add(prevBal_0));
            expect(await vaultToken.balanceOf(depositor_1.address)).to.be.equal((ethers.utils.parseUnits('0.99', 18)).add(prevBal_1));
        });
    });

    describe("VaultToken Fee Test", () => {
        before(async () => {
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
        });
        it('Take vault fees for deposit', async () => {
            const prevBal = await vaultToken.balanceOf(depositor.address);

            await vaultToken.connect(manager).adjustDepositFee(100);
            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(manager).sweepFees();
            
            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal((ethers.utils.parseUnits('0.99', 18)).add(prevBal));
            expect(await mockWETH.balanceOf(manager.address)).to.be.equal(ethers.utils.parseUnits('0.01', 18));
        });
        it('Take vault fees for withdrawing', async () => {
            await vaultToken.connect(manager).adjustWithdrawalFee(100);
            
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('0.99', 18));
            await vaultToken.connect(manager).sweepFees();
        });
        it('Verify ratio is still 1:1 (no sweep)', async () => {
            const prevBal_0 = await vaultToken.balanceOf(depositor.address);
            const prevBal_1 = await vaultToken.balanceOf(depositor_1.address);

            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await mockWETH.connect(depositor_1).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));

            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor_1).deposit(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal((ethers.utils.parseUnits('0.99', 18)).add(prevBal_0));
            expect(await vaultToken.balanceOf(depositor_1.address)).to.be.equal((ethers.utils.parseUnits('0.99', 18)).add(prevBal_1));
        });
    });

    describe("Protocol and Vault Fees Active", () => {
        before(async () => {
            await factory.connect(deployer).changeDepositFee(100);
            await factory.connect(deployer).changeWithdrawalFee(100);
        });
        it('Should correctly charge both fees at the same time (deposit)', async () => {
            const prevBal_0 = await vaultToken.balanceOf(depositor.address);
            const prevBal_1 = await vaultToken.balanceOf(depositor_1.address);
            const prevBal_admin = await mockWETH.balanceOf(deployer.address);

            await mockWETH.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await mockWETH.connect(depositor_1).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));

            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor_1).deposit(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal((ethers.utils.parseUnits('0.98', 18)).add(prevBal_0));
            expect(await vaultToken.balanceOf(depositor_1.address)).to.be.equal((ethers.utils.parseUnits('0.98', 18)).add(prevBal_1));
            expect(await mockWETH.balanceOf(deployer.address)).to.be.equal((ethers.utils.parseUnits('0.02', 18)).add(prevBal_admin));
        });
        it('Should correctly charge both fees at the same time (withdrawal)', async () => {
            const prevBal_0 = await mockWETH.balanceOf(depositor.address);
            const prevBal_1 = await mockWETH.balanceOf(depositor_1.address);
            const prevBal_admin = await mockWETH.balanceOf(deployer.address);

            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('0.98', 18));
            await vaultToken.connect(depositor_1).withdraw(ethers.utils.parseUnits('0.98', 18));

            expect(await mockWETH.balanceOf(depositor.address)).to.be.equal((ethers.utils.parseUnits('0.9604', 18)).add(prevBal_0));
            expect(await mockWETH.balanceOf(depositor_1.address)).to.be.equal((ethers.utils.parseUnits('0.9604', 18)).add(prevBal_1));
            expect(await mockWETH.balanceOf(deployer.address)).to.be.equal((ethers.utils.parseUnits('0.0196', 18)).add(prevBal_admin));
        });
    });

    describe("Reactivate withdrawal window", () => {
        before(async () => {
            await network.provider.send('evm_increaseTime', [86400]);
            await vaultToken.connect(manager).adjustDepositFee(0);
            await vaultToken.connect(manager).adjustWithdrawalFee(0);
            await factory.connect(deployer).changeDepositFee(0);
            await factory.connect(deployer).changeWithdrawalFee(0);
        });
        it('Should allow someone to withdraw without oToken being written', async () => {
            await expect(
                vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18))
            );
        });
        it("Shouldn't reopen the withdrawal window", async () => {
            await expect(
                vaultToken.reactivateWithdrawalWindow()
            ).to.be.revertedWith("Invalid");
        });
        it("Should allow anyone to reopen the withdrawal window", async () => {
            await network.provider.send('evm_increaseTime', [86400]);

            await expect(
                vaultToken.reactivateWithdrawalWindow()
            ).to.not.be.reverted;
        });
    });

    describe("Reserves test", () => {
        before(async () => {
            await vaultToken.connect(manager).adjustWithdrawalReserve(2000);
            await vaultToken.connect(manager).sweepFees();

            // Prepare the oToken
            mockOtokenTransaction = await otokenFactory.connect(fake_multisig).createOtoken(
                mockWETH.address,
                mockUSDC.address,
                mockWETH.address,
                ethers.utils.parseUnits('1000', 18),
                1640937600 + 604800 , // 2022 Jan. 7 @ 8 UTC
                false
            );

            const mockOtokenReceipt = await mockOtokenTransaction.wait();
            mockOtokenAddr = mockOtokenReceipt.events[1].args[0];

            mockOtoken = await ethers.getContractAt(
                'Otoken',
                mockOtokenAddr,
                fake_multisig
            );

            await network.provider.send('evm_increaseTime', [86400]);
        });

        it('Should naturally adjust for 100%', async () => {
            const mockWETHBalance = await mockWETH.balanceOf(vaultToken.address);
            
            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint16,address)'](
                    10000,
                    mockOtokenAddr
                )
            ).to.not.be.reverted;
            expect(await mockWETH.balanceOf(vaultToken.address)).to.be.equal(mockWETHBalance.mul(20).div(100))
            vaultToken = normalVaultToken;
        });

        it('Should expend some of the current reserves', async () => {
            const reserveAmount = await vaultToken.currentReserves();
            const prevBal_VT = await vaultToken.balanceOf(depositor.address);
            const prevBal_mockWETH = await mockWETH.balanceOf(depositor.address);

            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('0.2', 18));

            expect(await vaultToken.currentReserves()).to.be.equal(reserveAmount.sub(ethers.utils.parseUnits('0.2', 18)));
            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal(prevBal_VT.sub(ethers.utils.parseUnits('0.2', 18)));
            expect(await mockWETH.balanceOf(depositor.address)).to.be.equal(prevBal_mockWETH.add(ethers.utils.parseUnits('0.2', 18)));
        });

        it('Should fail to expend the reserves due to insufficient reserves', async () => {
            await expect(
                vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18))
            ).to.be.revertedWith("NotEnoughFunds_ReserveViolation()");
        });
    });

    describe("Put test", async () => {
        before(async () => {
            vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
                "Vault Put",
                "PUT",
                mockUSDC.address,
                86400, // 1 day
                ethers.utils.parseUnits('100', 18)
            );
    
            const receipt = await vaultTokenTransaction.wait();
    
            vaultToken = await ethers.getContractAt(
                'VaultToken',
                receipt.events[0].args.vaultToken,
                manager
            );

            mockOtokenTransaction = await otokenFactory.connect(fake_multisig).createOtoken(
                mockWETH.address,
                mockUSDC.address,
                mockUSDC.address,
                ethers.utils.parseUnits('1000', 6),
                1640937600 + 2419200, // 2022 Jan. 28 @ 8 UTC
                true
            );

            const mockOtokenReceipt = await mockOtokenTransaction.wait();
            mockOtokenAddr = mockOtokenReceipt.events[1].args[0];

            mockOtoken = await ethers.getContractAt(
                'Otoken',
                mockOtokenAddr,
                fake_multisig
            );
        });

        it('Should allow deposits in mockUSDC', async () => {
            await mockUSDC.connect(depositor).approve(vaultToken.address, 1000e6);
            await vaultToken.connect(depositor).deposit(1000e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal(ethers.utils.parseUnits('1000', 18));
            expect(await mockUSDC.balanceOf(vaultToken.address)).to.be.equal(1000e6);
        });

        it('Should withdraw fine', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('500', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.be.equal(ethers.utils.parseUnits('500', 18));
            expect(await mockUSDC.balanceOf(vaultToken.address)).to.be.equal(500e6);
        });

        it('Should accept put writes', async () => {
            await network.provider.send('evm_increaseTime', [86400]);

            normalVaultToken = vaultToken;
            vaultToken = new ethers.Contract(vaultToken.address, abi, manager);

            await expect(
                vaultToken.connect(manager)['writeOptions(uint256,address)'](
                    500e6,
                    mockOtokenAddr
                )
            ).to.not.be.reverted;
            vaultToken = normalVaultToken;
            expect(await mockOtoken.balanceOf(vaultToken.address)).to.be.equal(0.5e8);
        });

        it('Should settle fine without exercise', async () => {
            // Prepare the settlement
            await network.provider.send('evm_setNextBlockTimestamp', [ethers.BigNumber.from(await mockOtoken.expiryTimestamp()).toNumber() + 1]);
            await oracle.connect(pricer).setExpiryPrice(
                mockWETH.address,
                1640937600 + 2419200,
                1000e8
            );

            await vaultToken.settleVault();

            expect(await mockUSDC.balanceOf(vaultToken.address)).to.be.equal(500e6);
        });
    });

});