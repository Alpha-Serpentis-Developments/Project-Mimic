const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Opyn Social Token', () => {
    let ProtocolManager, Factory, Opyn_ST, TestExchangeAdapter, TestToken, OpynAdapter, protocolManager, factory, testToken, testExchangeAdapter, socialToken, socialTokenImpl, opynAdapter, deployer, manager, depositor0, depositor1;
    let pricer, mockUSDC, mockOtokenAddr, controller, fake_multisig, fake_addressBook, fake_airswap;

    before(async () => {
        ProtocolManager = await ethers.getContractFactory('ProtocolManager');
        Factory = await ethers.getContractFactory('contracts/mimic/Factory.sol:Factory');
        Opyn_ST = await ethers.getContractFactory('contracts/mimic/socialtoken/Opyn_ST.sol:Opyn_ST');
        TestExchangeAdapter = await ethers.getContractFactory('TestExchangeAdapter');
        TestToken = await ethers.getContractFactory('TestToken');
        OpynAdapter = await ethers.getContractFactory('OpynAdapter');

        OtokenFactory = await ethers.getContractFactory('OtokenFactory');
        Otoken = await ethers.getContractFactory('Otoken');
        Whitelist = await ethers.getContractFactory('Whitelist');
        Oracle = await ethers.getContractFactory('Oracle');
        MarginPool = await ethers.getContractFactory('MarginPool');
        MarginCalculator = await ethers.getContractFactory('MarginCalculator');
        MarginVault = await ethers.getContractFactory('MarginVault');
        AddressBook = await ethers.getContractFactory('AddressBook');
        Pricer = await ethers.getContractFactory('TestPricer');

        [deployer, manager, depositor0, depositor1, fake_multisig] = await ethers.getSigners();

        // Deploy all the addresses
        addressBook = await AddressBook.connect(deployer).deploy();
        otokenFactory = await OtokenFactory.connect(deployer).deploy(addressBook.address);
        otokenImpl = await Otoken.connect(deployer).deploy();
        whitelist = await Whitelist.connect(deployer).deploy(addressBook.address);
        oracle = await Oracle.connect(deployer).deploy();
        marginPool = await MarginPool.connect(deployer).deploy(addressBook.address);
        marginCalculator = await MarginCalculator.connect(deployer).deploy(oracle.address);
        marginVault = await MarginVault.connect(deployer).deploy();

        testToken = await TestToken.connect(depositor0).deploy(
            "TEST",
            "TEST",
            18,
            ethers.utils.parseUnits('1000', 18)
        );
        mockUSDC = await TestToken.connect(depositor0).deploy(
            "mockUSDC",
            "USDC",
            18,
            ethers.utils.parseUnits('1000', 18)
        ); 

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
            1923379200, // 2030 Dec. 13 @ 8 UTC
            false
        );

        const mockOtokenReceipt = await mockOtokenTransaction.wait();
        mockOtokenAddr = mockOtokenReceipt.events[1].args[0];

        mockOtoken = await ethers.getContractAt(
            'Otoken',
            mockOtokenAddr,
            fake_multisig
        );

        protocolManager = await ProtocolManager.deploy(
            deployer.address,
            0,
            0,
            0,
            0
        );
        factory = await Factory.deploy(
            protocolManager.address
        );
        socialTokenImpl = await Opyn_ST.deploy();
        await socialTokenImpl.initialize(
            "",
            "",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000001", // due to zero address
            0,
            0,
            0,
            0
        );
        await protocolManager.connect(deployer).addToTrustedList(
            "0x534f4349414c544f4b454e494d504c",
            socialTokenImpl.address
        );
        testExchangeAdapter = await TestExchangeAdapter.deploy();
        opynAdapter = await OpynAdapter.deploy(
            addressBook.address
        );

        await protocolManager.connect(deployer).addToTrustedList(
            "0x4f5054494f4e41444150544552",
            opynAdapter.address
        );
        await protocolManager.connect(deployer).addToTrustedList(
            "0x45584348414e474541444150544552",
            testExchangeAdapter.address
        );
        await protocolManager.connect(deployer).addToTrustedList(
            "0x4c454e44494e4741444150544552",
            "0x0000000000000000000000000000000000000000"
        );

        let socialTokenTX = await factory.connect(manager).deployNewSocialToken(
            "SocialTokenTest",
            "stTEST",
            socialTokenImpl.address,
            testToken.address,
            opynAdapter.address,
            testExchangeAdapter.address,
            "0x0000000000000000000000000000000000000000",
            manager.address,
            0,
            0,
            0,
            0
        );

        const receipt = await socialTokenTX.wait();

        // console.log(receipt.events[2].args.token);

        socialToken = await ethers.getContractAt(
            'Opyn_ST',
            receipt.events[2].args.token,
            manager
        );

        await socialToken.connect(manager).allowOpynAdapter(controller.address);
    });
    describe("Verify initialization", () => {
        // this test is necessary to verify the Initializable contract performs as anticipated due to an optimization change
        it('Should not reinitialize', async () => {
            await expect(
                socialTokenImpl.initialize(
                    "",
                    "",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000001", // due to zero address
                    0,
                    0,
                    0,
                    0
                )
            ).to.be.revertedWith("Initializable: contract is already initialized");

            await expect(
                socialToken.initialize(
                    "",
                    "",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000001", // due to zero address
                    0,
                    0,
                    0,
                    0
                )
            ).to.be.revertedWith("Initializable: contract is already initialized");
        });
    });
    describe("Deposit", () => {
        it('Should mint 1:1 for a zero-supply deposit', async () => {
            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountSocialToken = await socialToken.balanceOf(depositor0.address);

            await testToken.connect(depositor0).approve(
                socialToken.address,
                ethers.utils.parseUnits('1', 18)
            );

            await socialToken.connect(depositor0).deposit(
                await ethers.utils.parseUnits('1', 18)
            );

            expect(await socialToken.balanceOf(depositor0.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('1', 18)));
            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountSocialToken.add(ethers.utils.parseUnits('1', 18)));
        });
        it('Should still be 1:1 after initial deposit', async () => {
            let previousAmountTestToken = await testToken.balanceOf(socialToken.address); // basically the same code
            let previousAmountSocialToken = await socialToken.balanceOf(depositor0.address);

            await testToken.connect(depositor0).approve(
                socialToken.address,
                ethers.utils.parseUnits('1', 18)
            );

            await socialToken.connect(depositor0).deposit(
                await ethers.utils.parseUnits('1', 18)
            );

            expect(await socialToken.balanceOf(depositor0.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('1', 18)));
            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountSocialToken.add(ethers.utils.parseUnits('1', 18)));
        });
        it('Should properly account for 10% protocol fee', async () => {
            // set the protocol fee to 10% for deposit
            await protocolManager.connect(deployer).modifyDepositFee(1000);

            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountSocialToken = await socialToken.balanceOf(depositor0.address);

            await testToken.connect(depositor0).approve(
                socialToken.address,
                ethers.utils.parseUnits('1', 18)
            );

            await socialToken.connect(depositor0).deposit(
                await ethers.utils.parseUnits('1', 18)
            );

            expect(await socialToken.balanceOf(depositor0.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('.9', 18)));
            expect(await testToken.balanceOf(protocolManager.address)).to.be.equal(ethers.utils.parseUnits('.1', 18));
            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountSocialToken.add(ethers.utils.parseUnits('.9', 18)));
        });
        it('Should properly account for 10% protocol + 10% social trader fee', async () => {
            // set the social trader fee to 10% for deposit
            await socialToken.connect(manager).modifyFees(ethers.utils.formatBytes32String("DEPOSIT"), 1000);

            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountSocialToken = await socialToken.balanceOf(depositor0.address);
            let previousProtocolFees = await testToken.balanceOf(protocolManager.address);

            await testToken.connect(depositor0).approve(
                socialToken.address,
                ethers.utils.parseUnits('1', 18)
            );

            await socialToken.connect(depositor0).deposit(
                await ethers.utils.parseUnits('1', 18)
            );

            expect(await socialToken.balanceOf(depositor0.address)).to.be.equal(previousAmountSocialToken.add(ethers.utils.parseUnits('.8', 18)));
            expect(await testToken.balanceOf(protocolManager.address)).to.be.equal(previousProtocolFees.add(ethers.utils.parseUnits('.1', 18)));
            expect(await socialToken.unredeemedFees()).to.be.equal(ethers.utils.parseUnits('0.1', 18));
            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('.9', 18)));
        });
        it('Should properly account for a ratio change (1:2)', async () => {
            // disable fees
            await socialToken.connect(manager).modifyFees(ethers.utils.formatBytes32String("DEPOSIT"), 0);
            await protocolManager.connect(deployer).modifyDepositFee(0);

            // rugged
            await testToken.connect(depositor0).rugPull((await testToken.balanceOf(socialToken.address)).sub(await socialToken.unredeemedFees()).div(2), socialToken.address);

            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountSocialToken = await socialToken.balanceOf(depositor0.address);

            await testToken.connect(depositor0).approve(
                socialToken.address,
                ethers.utils.parseUnits('1', 18)
            );

            await socialToken.connect(depositor0).deposit(
                await ethers.utils.parseUnits('1', 18)
            );

            expect(await socialToken.balanceOf(depositor0.address)).to.be.equal(previousAmountSocialToken.add(ethers.utils.parseUnits('2', 18)));
            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('1', 18)));
        });
    });
    describe("Withdraw", () => {

    });
    describe("Light Opyn option adapter testing", () => {
        it('Should not allow for an undefined position to be opened', async () => {
            const types = [
                "address",
                "address",
                "address",
                "uint256",
                "uint256",
                "uint256",
                "bytes"
            ];

            // let abiCoder = new ethers.utils.abiCoder();
            let encodedArgs = new ethers.utils.AbiCoder().encode(
                types,
                [
                    socialToken.address,
                    socialToken.address,
                    "0x0000000000000000000000000000000000000000",
                    1,
                    0,
                    0,
                    "0x"
                ]
            );

            await expect(
                socialToken.connect(manager).openPosition(
                    [2],
                    [
                        "0x",
                        [
                            "0x0000000000000000000000000000000000000000",
                            "0x0000000000000000000000000000000000000000",
                            0,
                            0,
                            "0x0000000000000000000000000000000000000000",
                            0
                        ],
                        0,
                        0,
                        0
                    ],
                    [encodedArgs]
                )
            ).to.be.revertedWith("Invalid_ZeroValue()");

            // await socialToken.connect(manager).openVault();
        });
        it('Should allow you to open a short position (multi-action)', async () => {
            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);

            const types = [
                "address",
                "address",
                "address",
                "uint256",
                "uint256",
                "uint256",
                "bytes"
            ];

            let approvalArgs = new ethers.utils.AbiCoder().encode(
                ["address", "address", "uint256"],
                [
                    testToken.address,
                    marginPool.address,
                    ethers.utils.parseUnits('1', 18)
                ]
            );

            let encodedArgs0 = new ethers.utils.AbiCoder().encode(
                types,
                [
                    socialToken.address,
                    socialToken.address,
                    "0x0000000000000000000000000000000000000000",
                    1,
                    0,
                    0,
                    "0x"
                ]
            );
            let encodedArgs1 = new ethers.utils.AbiCoder().encode(
                types,
                [
                    socialToken.address,
                    socialToken.address,
                    testToken.address,
                    1,
                    ethers.utils.parseUnits('1', 18),
                    0,
                    "0x"
                ]
            );
            let encodedArgs2 = new ethers.utils.AbiCoder().encode(
                types,
                [
                    socialToken.address,
                    socialToken.address,
                    mockOtoken.address,
                    1,
                    ethers.utils.parseUnits('1', 8),
                    0,
                    "0x"
                ]
            );

            await expect(
                socialToken.connect(manager).openPosition(
                    [12,2,0,3], // increase_allowance -> open -> deposit collat -> write options
                    [
                        "0x", // optional data
                        [
                            testToken.address, // collateral
                            mockUSDC.address, // underlying
                            0, // expiration
                            0, // strike
                            mockOtoken.address, // token
                            1 // option type
                        ],
                        ethers.utils.parseUnits('1', 8), // size
                        ethers.utils.parseUnits('1', 18), // costbasis
                        0 // isLong
                    ],
                    [approvalArgs,encodedArgs0, encodedArgs1, encodedArgs2]
                )
            ).to.not.be.reverted;

            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountTestToken.sub(ethers.utils.parseUnits('1', 18)));
            expect(await mockOtoken.balanceOf(socialToken.address)).to.be.equal(ethers.utils.parseUnits('1', 8));

            let position = await socialToken.positions(0);

            console.log(position);
        });
        it('Should allow you to open a short position (batch)', async () => {
            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountOtokens = await mockOtoken.balanceOf(socialToken.address);

            let approvalArgs = new ethers.utils.AbiCoder().encode(
                ["address", "address", "uint256"],
                [
                    testToken.address,
                    marginPool.address,
                    ethers.utils.parseUnits('1', 18)
                ]
            );

            let encodedArgsBatch = new ethers.utils.AbiCoder().encode(
                [
                    "tuple(uint8, address, address, address, uint256, uint256, uint256, bytes)[]"
                ],
                [
                    [
                        [
                            0,
                            socialToken.address,
                            socialToken.address,
                            "0x0000000000000000000000000000000000000000",
                            2,
                            0,
                            0,
                            "0x"
                        ],
                        [
                            5,
                            socialToken.address,
                            socialToken.address,
                            testToken.address,
                            2,
                            ethers.utils.parseUnits('1', 18),
                            0,
                            "0x"
                        ],
                        [
                            1,
                            socialToken.address,
                            socialToken.address,
                            mockOtoken.address,
                            2,
                            ethers.utils.parseUnits('1', 8),
                            0,
                            "0x"
                        ]
                    ]
                ]
            );

            await expect(
                socialToken.connect(manager).openPosition(
                    [12,14], // increase_allowance -> batch (open vault -> dep. collat. -> write options)
                    [
                        "0x", // optional data
                        [
                            testToken.address, // collateral
                            mockUSDC.address, // underlying
                            0, // expiration
                            0, // strike
                            mockOtoken.address, // token
                            1 // option type
                        ],
                        ethers.utils.parseUnits('1', 8), // size
                        ethers.utils.parseUnits('1', 18), // costbasis
                        0 // isLong
                    ],
                    [approvalArgs,encodedArgsBatch]
                )
            ).to.not.be.reverted;
            
            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountTestToken.sub(ethers.utils.parseUnits('1', 18)));
            expect(await mockOtoken.balanceOf(socialToken.address)).to.be.equal(previousAmountOtokens.add(ethers.utils.parseUnits('1', 8)));
        });
        it('Should close out vault #1 via modifyPositions', async () => {
            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountOtokens = await mockOtoken.balanceOf(socialToken.address);

            let encodedArgs0 = new ethers.utils.AbiCoder().encode(
                ["address", "address", "address", "uint256", "uint256", "uint256", "bytes"],
                [
                    socialToken.address,
                    socialToken.address,
                    mockOtoken.address,
                    1,
                    ethers.utils.parseUnits('1', 8),
                    0,
                    "0x"
                ]
            );
            let encodedArgs1 = new ethers.utils.AbiCoder().encode(
                ["address", "address", "address", "uint256", "uint256", "uint256", "bytes"],
                [
                    socialToken.address,
                    socialToken.address,
                    testToken.address,
                    1,
                    ethers.utils.parseUnits('1', 18),
                    0,
                    "0x"
                ]
            );

            await expect(
                socialToken.connect(manager).modifyPosition(
                    [4,1], // burn_option -> remove_collateral
                    0,
                    [encodedArgs0, encodedArgs1]
                )
            ).to.not.be.reverted;

            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('1', 18)));
            expect(await mockOtoken.balanceOf(socialToken.address)).to.be.equal(previousAmountOtokens.sub(ethers.utils.parseUnits('1', 8)));
        });
        it('Should close out vault #2 via closePosition', async () => {
            let previousAmountTestToken = await testToken.balanceOf(socialToken.address);
            let previousAmountOtokens = await mockOtoken.balanceOf(socialToken.address);

            let encodedArgsBatch = new ethers.utils.AbiCoder().encode(
                [
                    "tuple(uint256,address,address,address,uint256,uint256,uint256,bytes)[]"
                ],
                [
                    [
                        [
                            2,
                            socialToken.address,
                            socialToken.address,
                            mockOtoken.address,
                            2,
                            ethers.utils.parseUnits('1', 8),
                            0,
                            "0x"
                        ],
                        [
                            6,
                            socialToken.address,
                            socialToken.address,
                            testToken.address,
                            2,
                            ethers.utils.parseUnits('1', 18),
                            0,
                            "0x" 
                        ]
                    ]
                ]
                
            );

            await expect(
                socialToken.connect(manager).modifyPosition(
                    [14], // batch (burn -> remove collat)
                    0,
                    [encodedArgsBatch]
                )
            ).to.not.be.reverted;

            expect(await testToken.balanceOf(socialToken.address)).to.be.equal(previousAmountTestToken.add(ethers.utils.parseUnits('1', 18)));
            expect(await mockOtoken.balanceOf(socialToken.address)).to.be.equal(previousAmountOtokens.sub(ethers.utils.parseUnits('1', 8)));
        });
    });

});