const { expect } = require("chai");
const { ethers } = require("ethers");

describe('Protocol Manager', () => {
    let ProtocolManager, Factory, TestSocialToken, OpynAdapter, protocolManager, factory, testSocialToken, opynAdapter, deployer, manager;

    beforeEach(async () => {
        ProtocolManager = await ethers.getContractFactory('ProtocolManager');
        Factory = await ethers.getContractFactory('contracts/mimic/Factory.sol:Factory');
        TestSocialToken = await ethers.getContractFactory('TestSocialToken');
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
    });

    describe("Add new social token implementation to the trusted list", () => {
        it('Should add the social token implementation to the trusted list', async () => {
            testSocialToken = await TestSocialToken.deploy();
            await testSocialToken.initialize(
                "",
                "",
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000001",
                0,
                0,
                0,
                0
            );

            await protocolManager.connect(deployer).addToTrustedList(
                "0x534f4349414c544f4b454e494d504c",
                testSocialToken.address
            );

            expect(await protocolManager.isTrusted(
                "0x534f4349414c544f4b454e494d504c",
                testSocialToken.address
            )).to.be.equal(true);
        });
    });
});