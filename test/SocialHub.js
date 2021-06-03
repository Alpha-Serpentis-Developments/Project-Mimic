const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe('SocialHub test', () => {
	let SocialHub;
	let socialHub, socialTraderToken, deployer, manager, depositor;

	const zeroAddress = "0x0000000000000000000000000000000000000000";

	before(async () => {
		console.log("NOTICE: If you get an error, make sure to run 'npx hardhat clean' to clear artifacts")

		SocialHub = await ethers.getContractFactory('SocialHub');

		[deployer, manager, depositor] = await ethers.getSigners();
	});
	
	describe('Deploy SocialHub w/o predecessor', () => {
		it('Should revert the deployment of the SocialHub', async () => {
			await expect(
				SocialHub.connect(deployer).deploy(zeroAddress, zeroAddress)
			).to.be.reverted;
		});
		it('Should deploy SocialHub successfully', async () => {
			socialHub = await SocialHub.connect(deployer).deploy(
				zeroAddress,
				deployer.address
			);

			expect(socialHub.address).to.not.equal(zeroAddress);
		});
	});

});
