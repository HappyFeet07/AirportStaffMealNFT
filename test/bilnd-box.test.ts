import { ethers } from 'hardhat';
import { BigNumber, Signer, ContractTransaction } from 'ethers';
import { expect, use, util } from 'chai';
import {
  AirportStaffMeal,
  AirportStaffMeal__factory
} from '../typechain-types';
let utils = ethers.utils;

describe('AirportStaffMeal Test', () => {
  let deployer:Signer, user1: Signer, user2: Signer;
  let nftContract: AirportStaffMeal;
  const baseURI = "ipfs://QmTXGcuZbg996PuqfthXkkfYYhT3YVfJbGdMeA1HJV74Mw/";
  const purchaseMsgValue = BigNumber.from(utils.parseEther('0.01'));
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  const phase1amount = 5;
  const phase2amount = 5;

  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory('AirportStaffMeal') as AirportStaffMeal__factory;
    nftContract = await ContractFactory.connect(deployer).deploy(
      19, // TOTAL SUPPLY
      1,  // MAX PURCHASE
      phase1amount, // FIRST PHASE SUPPLY
      phase2amount,  // SECOND PHASE SUPPLY
      baseURI
    );
  })

  describe('Deployment test', () => {
    it("Should be correctly deployed", async () => {
      const owner = await nftContract.owner();
      expect(owner).to.eql(await deployer.getAddress());
      expect(await nftContract.totalSupply()).to.eql(BigNumber.from(19));
    });
  })

  describe('Phase1 test', () => {
    it("Should be revert if phase1 hasn't started", async () => {
      const errorMsg = "Airport Meal NFT: Event hasn't started yet.";
      expect(
        nftContract.connect(user1)['mintForFirstPhase']({ value: purchaseMsgValue})
      ).to.revertedWith(errorMsg);
    })

    it("Should be able to mint in phase1", async () => {
      const firstTokenId = BigNumber.from(0)
      const secondTokenId = BigNumber.from(1)
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();
      let tx: ContractTransaction;

      await nftContract.connect(deployer).startPhase1Sale();
      tx = await nftContract.connect(user1)['mintForFirstPhase']({ value: purchaseMsgValue});
      await expect(tx)
        .emit(nftContract, 'Transfer')
        .withArgs(
          zeroAddr,
          user1Addr,
          firstTokenId
        )
      expect(await nftContract.ownerOf(firstTokenId))
        .to.eql(user1Addr);

      tx = await nftContract.connect(user2)['mintForFirstPhase']({ value: purchaseMsgValue});
      await expect(tx)
        .emit(nftContract, 'Transfer')
        .withArgs(
          zeroAddr,
          user2Addr,
          secondTokenId
        )
      expect(await nftContract.ownerOf(secondTokenId))
        .to.eql(user2Addr);
    })
  })

  describe('Phase2 test', () => {
    beforeEach(async () => {
      const user1Addr = await user1.getAddress();
      const maxFirstPhase = BigNumber.from(phase1amount);

      await nftContract.connect(deployer).startPhase1Sale();
      for(let i = 0; i < phase1amount; i++) {
        await nftContract.connect(user1)['mintForFirstPhase']({ value: purchaseMsgValue });
      }
      expect(await nftContract.balanceOf(user1Addr))
        .to.eql(maxFirstPhase);
      expect(await nftContract.firstSaleActive())
        .to.eql(false);
    })

    it('Should be revert if phase2 hasn\'t started', async () => {
      let errorMsg = "Airport Meal NFT: Event hasn't started yet.";
      expect(
        nftContract.connect(user2)['mintForSecondPhase']({ value: purchaseMsgValue })
      ).to.revertedWith(errorMsg);
    })

    it('Should be able to mint in phase2',async () => {
      let tx: ContractTransaction;
      const firstTokenId = BigNumber.from(5);
      const user2Addr = await user2.getAddress();

      await nftContract.connect(deployer).startPhase2Sale();
      tx = await nftContract.connect(user2)['mintForSecondPhase']({ value: purchaseMsgValue });
      await expect(tx)
        .emit(nftContract, 'Transfer')
        .withArgs(
          zeroAddr,
          user2Addr,
          firstTokenId
        )
      expect(await nftContract.ownerOf(firstTokenId))
        .to.eql(user2Addr);
    })
  })
})
