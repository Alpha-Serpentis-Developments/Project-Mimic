const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe('SocialHub test', () => {
	let SocialHub;
	let socialHub, newerSocialHub, socialTraderToken, deployer, manager, depositor, fake_traderManager, fake_dao;

	const zeroAddress = "0x0000000000000000000000000000000000000000";

	before(async () => {
		console.log("NOTICE: If you get an error, make sure to run 'npx hardhat clean' to clear artifacts")

		SocialHub = await ethers.getContractFactory('SocialHub');

		[deployer, manager, depositor, fake_traderManager, fake_dao] = await ethers.getSigners();
	});
	
	
	describe('Deploy SocialHub w/o predecessor', () => {
		it('Should revert the deployment of the SocialHub', async () => {
			await expect(
				SocialHub.connect(deployer).deploy(zeroAddress, zeroAddress)
			).to.be.revertedWith("ZeroAddress");
		});
		it('Should deploy SocialHub successfully', async () => {
			socialHub = await SocialHub.connect(deployer).deploy(
				zeroAddress,
				deployer.address
			);

			expect(socialHub.address).to.not.equal(zeroAddress);
		});
	});
	describe('Whitelist functions', () => {
		it('Should add a new address to the whitelist', async () => {
			await socialHub.connect(deployer).addToWhitelist(fake_traderManager.address);

			expect(await socialHub.whitelisted(fake_traderManager.address)).to.equal(true);
		});
		it('Should remove an address from the whitelist', async () => {
			await socialHub.connect(deployer).removeFromWhitelist(fake_traderManager.address);

			expect(await socialHub.whitelisted(fake_traderManager.address)).to.equal(false);
		});
	});
	describe('Become a social trader (aka deploy social token)', () => {
		before(async () => {
			await socialHub.connect(deployer).addToWhitelist(fake_traderManager.address);
		});
		it('Should allow a user to become a social trader', async () => {
			const becomeSocialTraderTX = await socialHub.connect(manager).becomeSocialTrader(
				ethers.utils.formatBytes32String("Social Token"), // token name
				ethers.utils.formatBytes32String("SOCIAL"), // token symbol
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
	describe('Modify protocol-level fees', () => {
		it('Should modify minting, take profit, and withdrawal at the protocol level', async () => {
			await socialHub.connect(deployer).modifyMintingFee(5000);
			await socialHub.connect(deployer).modifyTakeProfitFee(5000);
			await socialHub.connect(deployer).modifyWithdrawalFee(5000);

			expect(await socialHub.mintingFee()).to.equal(5000);
			expect(await socialHub.takeProfitFee()).to.equal(5000);
			expect(await socialHub.withdrawalFee()).to.equal(5000);
		});
		it('Should REVERT for going out of bounds', async () => {
			await expect(
				socialHub.connect(deployer).modifyMintingFee(5001)
			).to.be.revertedWith("OutOfBounds");
		});
	});
	describe('Deprecate the social hub', () => {
		before(async () => {
			newerSocialHub = await SocialHub.connect(deployer).deploy(
				socialHub.address,
				deployer.address
			);
			await newerSocialHub.connect(deployer).addToWhitelist(fake_traderManager.address);
		});
		it('Should deprecate the current social hub and go to the new', async () => {
			await socialHub.connect(deployer).deprecate(
				newerSocialHub.address
			);

			await expect(
				socialHub.connect(deployer).modifyMintingFee(0)
			).to.be.revertedWith("Deprecated");
		});
		it('Should transfer details AND make a new token to the new social hub', async () => {
			const changeAndCreateTX = await socialTraderToken.connect(manager).changeSocialHubs(
				true, // generate new token
				ethers.utils.formatBytes32String("Social Token v2"), // new name
				ethers.utils.formatBytes32String("SOCIALv2"), // new symbol
				0, // new minting fee
				0, // new profit take fee
				0, // new withdrawal fee
				false // allow unsafe modules
			);
			const changeAndCreateReceipt = await changeAndCreateTX.wait();

			expect(socialTraderToken.address).to.not.be.equal(changeAndCreateReceipt.events[1].topics[0]);
			expect(changeAndCreateReceipt.events[1].topics[0]).to.not.be.equal(zeroAddress);
			expect(await (await socialHub.listOfSocialTraders(socialTraderToken.address)).socialTrader).to.be.equal(zeroAddress);
		});
	});
	describe('Protocol-level fees test', () => {
		before(async () => {

		});
		it('Should set the new minting fees', () => {

		});
		it('Should send the minting fees ')
	});
	describe('Hand off the admin', () => {
		it('Should hand off the admin', async () => {
			await newerSocialHub.connect(deployer).changeAdmin(fake_dao.address);
		});
	});
});
