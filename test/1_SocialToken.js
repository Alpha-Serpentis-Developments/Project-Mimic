const { ethers } = require("hardhat");

describe('Social Token', () => {
    let ProtocolManager, Factory, TestSocialToken, TestExchangeAdapter, TestToken, OpynAdapter, protocolManager, factory, testToken, testExchangeAdapter, socialToken, socialTokenImpl, opynAdapter, deployer, manager, depositor0, depositor1;

    beforeEach(async () => {
        ProtocolManager = await ethers.getContractFactory('ProtocolManager');
        Factory = await ethers.getContractFactory('contracts/mimic/Factory.sol:Factory');
        TestSocialToken = await ethers.getContractFactory('TestSocialToken');
        TestExchangeAdapter = await ethers.getContractFactory('TestExchangeAdapter');
        TestToken = await ethers.getContractFactory('TestToken');
        OpynAdapter = await ethers.getContractFactory('OpynAdapter');

        [deployer, manager] = await ethers.getSigners();

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
        testSocialTokenImpl = await TestSocialToken.deploy();
        testToken = await TestToken.connect(manager).deploy(
            "TEST",
            "TEST",
            18,
            ethers.utils.parseUnits('1000', 18)
        );
        await testSocialTokenImpl.initialize(
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
            testSocialTokenImpl.address
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
            testSocialTokenImpl.address,
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
    });

    describe("Deposit", () => {
        it('Should mint 1:1 for a zero-supply deposit', async () => {

        });
        it('Should still be 1:1 after initial deposit', async () => {

        });
        it('Should properly account for 10% protocol fee', async () => {

        });
        it('Should properly account for 10% protocol + 10% social trader fee', async () => {

        });
        it('Should properly account for a ratio change (1:2)', async () => {

        });
    });

});