import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Sharex } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

describe("Sharex", ()=> {
  let sharex: Sharex;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const SharexFactory = await ethers.getContractFactory("Sharex")
    sharex = await SharexFactory.connect(owner).deploy();
    await sharex.deployed();
  })

  it("Should upload an url", async () => {
    const url = "https://www.google.com";
    const timestamp = await time.latest();
    const secret = "secret";
    await expect(sharex.connect(user1).uploadFile(url, secret, timestamp + 60*2))
      .not.to.be.reverted;
  })

  it("Should download an url by user2", async () => {
    const url = "https://www.google.com";
    const timestamp = await time.latest();
    const secret = "secret";
    const key = ethers.utils.solidityKeccak256(["string", "string", "address"], [url,secret,user1.address]);

    await sharex.connect(user1).uploadFile(url, secret, timestamp + 60*2);
    const result = await sharex.connect(user2).getFile(key);
    expect(result).to.equal(url);
  })

  it("Should not download an url by user2 (expired)", async () => {
    const url = "https://www.google.com";
    const timestamp = await time.latest();
    const expiredTTL = 60*2;
    const secret = "secret";
    const key = ethers.utils.solidityKeccak256(["string", "string", "address"], [url,secret,user1.address]);
    await sharex.connect(user1).uploadFile(url, secret, timestamp+expiredTTL);
    await time.increase(expiredTTL+1);
    await expect(sharex.connect(user2).getFile(key))
      .to.be.revertedWith("Sharex: Key expired or not found");
  })

  it("Should set fee and claim fee by owner", async () => {
    // Set fee
    const fee = ethers.utils.parseEther("0.0001");
    await sharex.connect(owner).setFee(fee);
    
    // Upload file
    const url = "https://www.google.com";
    const timestamp = await time.latest();
    const expiredTTL = 60*2;
    const secret = "secret";
    await sharex.connect(user1).uploadFile(url, secret, timestamp+expiredTTL, {
      value: fee
    });

    // Claim fee
    const before = await owner.getBalance();
    const tx = await sharex.connect(owner).claimFee();
    const receipt = await tx.wait();
    const gasFee = receipt.gasUsed.mul(tx.gasPrice as BigNumber);
    const after = await owner.getBalance();
    expect(after.sub(before).add(gasFee)).to.equal(fee);
  })

  it("Should not claim fee by non-owner", async () => {
    await expect(sharex.connect(user1).claimFee())
      .to.be.revertedWith("Ownable: caller is not the owner");
  })

  it("Should not setFee by non-owner", async () => {
    const fee = ethers.utils.parseEther("0.0001");
    await expect(sharex.connect(user1).setFee(fee))
      .to.be.revertedWith("Ownable: caller is not the owner");
  })

  it("Should not upload since insufficient fee", async () => {
     // Set fee
    const fee = ethers.utils.parseEther("0.0001");
    await sharex.connect(owner).setFee(fee);

    // Upload file
    const url = "https://www.google.com";
    const timestamp = await time.latest();
    const expiredTTL = 60*2;
    const secret = "secret";
    await expect(sharex.connect(user1).uploadFile(url, secret, timestamp+expiredTTL))
      .to.be.revertedWith("Sharex: Insufficient fee")
  })
})