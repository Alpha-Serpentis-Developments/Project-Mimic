const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const utils = ethers.utils;

describe('SocialHub test', () => {
	let SocialHub;
	let socialHub, socialTraderToken, deployer, manager, depositor, fake_traderManager;

	const zeroAddress = "0x0000000000000000000000000000000000000000";

	before(async () => {
		console.log("NOTICE: If you get an error, make sure to run 'npx hardhat clean' to clear artifacts")

		SocialHub = await ethers.getContractFactory('SocialHub');

		[deployer, manager, depositor, fake_traderManager] = await ethers.getSigners();
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
	describe('Use the modify fees on the SocialHub', () => {
		it('Should revert all three fee modifications for out of bounds', async () => {
			await expect(
				socialHub.connect(deployer).modifyMintingFee(5001)
			).to.be.reverted;
			await expect(
				socialHub.connect(deployer).modifyTakeProfitFee(5001)
			).to.be.reverted;
			await expect(
				socialHub.connect(deployer).modifyWithdrawalFee(5001)
			).to.be.reverted;
		});
		it('Should NOT revert all three fee modifications and make changes @ 50%', async () => {
			await expect(
				socialHub.connect(deployer).modifyMintingFee(5000)
			).to.not.be.reverted;
			await expect(
				socialHub.connect(deployer).modifyTakeProfitFee(5000)
			).to.not.be.reverted;
			await expect(
				socialHub.connect(deployer).modifyWithdrawalFee(5000)
			).to.not.be.reverted;

			expect(await socialHub.mintingFee()).to.equal(5000);
			expect(await socialHub.takeProfitFee()).to.equal(5000);
			expect(await socialHub.withdrawalFee()).to.equal(5000);
		});
	});
	describe('Become a social trader (aka deploy social token)', () => {
		it('Should allow a user to become a social trader', async () => {
			const becomeSocialTraderTX = await socialHub.connect(manager).becomeSocialTrader(
				utils.formatBytes32String("Social Token"), // token name
				utils.formatBytes32String("SOCIAL"), // token symbol
				utils.formatBytes32String("AlphaSerpentis_"), // twitter handle
				0, // minting fee @ 0%
				0, // profit take fee @ 0%,
				0, // withdrawal fee @ 0%
				false, // disallow unsafe modules,
				fake_traderManager.address // trader manager
			);
			const becomeSocialTraderReceipt = await becomeSocialTraderTX.wait();
			socialTraderToken = await ethers.getContractAt(
				'SocialTraderToken',
				becomeSocialTraderReceipt.events[0].args[0],
				manager
			);

			expect(await socialTraderToken.admin()).to.equal(manager.address);
			expect(await socialTraderToken.name()).to.equal("Social Token");
			expect(await socialTraderToken.symbol()).to.equal("SOCIAL");
		});
	});
	describe('Verify a social trader', () => {
		it('Should verify the social trader', async () => {
			await expect(
				socialHub.connect(deployer).verifySocialTraderToken(socialTraderToken.address)
			).to.not.be.reverted;
		});
	});
	describe('Whitelist functions', () => {
		it('Should add a new address to the whitelist', async () => {
			await socialHub.connect(deployer).addToWhitelist(fake_traderManager.address);

			expect(await socialHub.whitelisted(fake_traderManager.address)).to.be.equal(true);
		});
		it('Should remove an address from the whitelist', async () => {
			await socialHub.connect(deployer).removeFromWhitelist(fake_traderManager.address);

			expect(await socialHub.whitelisted(fake_traderManager.address)).to.be.equal(false);
		});
	});
	describe('Modify protocol-level fees', () => {
		it('Should modify minting, take profit, and withdrawal at the protocol level', async () => {
			await socialHub.connect(deployer).modifyMintingFee(5000);
			await socialHub.connect(deployer).modifyTakeProfitFee(5000);
			await socialHub.connect(deployer).modifyWithdrawalFee(5000);

			expect(await socialHub.mintingFee()).to.be.equal(5000);
			expect(await socialHub.takeProfitFee()).to.be.equal(5000);
			expect(await socialHub.withdrawalFee()).to.be.equal(5000);
		});
		it('Should REVERT for going out of bounds', async () => {
			await expect(
				socialHub.connect(deployer).modifyMintingFee(5001)
			).to.be.reverted;
		});
	});
});
