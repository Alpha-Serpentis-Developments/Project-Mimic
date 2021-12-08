const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Social Token', () => {
    let ProtocolManager, Factory, TestSocialToken, TestExchangeAdapter, TestToken, OpynAdapter, protocolManager, factory, testToken, testExchangeAdapter, socialToken, socialTokenImpl, opynAdapter, deployer, manager, depositor0, depositor1;

    before(async () => {
        ProtocolManager = await ethers.getContractFactory('ProtocolManager');
        Factory = await ethers.getContractFactory('contracts/mimic/Factory.sol:Factory');
        TestSocialToken = await ethers.getContractFactory('contracts/mimic/test/TestSocialToken.sol:TestSocialToken');
        TestExchangeAdapter = await ethers.getContractFactory('TestExchangeAdapter');
        TestToken = await ethers.getContractFactory('TestToken');
        OpynAdapter = await ethers.getContractFactory('OpynAdapter');

        [deployer, manager, depositor0, depositor1] = await ethers.getSigners();

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
        socialTokenImpl = await TestSocialToken.deploy();
        testToken = await TestToken.connect(depositor0).deploy(
            "TEST",
            "TEST",
            18,
            ethers.utils.parseUnits('1000', 18)
        );
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
            "0x0000000000000000000000000000000000000000" // doesn't have to be the actual address book for this test
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
            'TestSocialToken',
            receipt.events[2].args.token,
            manager
        );
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

});