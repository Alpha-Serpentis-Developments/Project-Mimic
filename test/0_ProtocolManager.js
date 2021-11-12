const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Protocol Manager', () => {
    let ProtocolManager, Factory, TestSocialToken, OpynAdapter, protocolManager, factory, testSocialToken, testSocialTokenImpl, opynAdapter, deployer, manager;

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
            testSocialTokenImpl = await TestSocialToken.deploy();
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

            expect(await protocolManager.isTrusted(
                "0x534f4349414c544f4b454e494d504c",
                testSocialTokenImpl.address
            )).to.be.equal(true);
        });
        it('Should add the Opyn adapter to the trusted list', async () => {
            opynAdapter = await OpynAdapter.deploy(
                "0x0000000000000000000000000000000000000000" // doesn't have to be the actual address book for this test
            );

            await protocolManager.connect(deployer).addToTrustedList(
                "0x4f5054494f4e41444150544552",
                opynAdapter.address
            );

            expect(await protocolManager.isTrusted(
                "0x4f5054494f4e41444150544552",
                opynAdapter.address
            )).to.be.equal(true);
        });
    });
});