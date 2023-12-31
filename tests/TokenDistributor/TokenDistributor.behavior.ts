import { ethers } from "hardhat";
import { expect } from "chai";
import hre from "hardhat";

// import json from files

import * as TDParameters from "./TokenDistributor.param";
import { signDelegateTransaction } from "../../helpers/sign";
import type { TokenDistributor } from "../../types/contracts/TokenDistributor";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployTokenFixture } from "./TokenDistributor.fixture";

export async function shouldBehaveLikeTD(): Promise<void> {
  it("delegation at deploy should emit event", async function () {
    const TokenDistributor = await ethers.getContractFactory(
      "TokenDistributor"
    );
    expect(
      await TokenDistributor.connect(this.signers.admin).deploy(
        TDParameters.root,
        this.token.getAddress(),
        TDParameters.totalClaimable,
        TDParameters.claimPeriodStart,
        TDParameters.claimPeriodEnd,
        this.signers.admin.getAddress()
      )
    ).to.emit(TokenDistributor, "Delegated");
  });

  it("should initialize the contract correctly", async function () {
    expect(await this.tokenDistributor.root()).to.equal(this.root);
    expect(await this.tokenDistributor.token()).to.equal(
      await this.token.getAddress()
    );
    expect(await this.tokenDistributor.totalClaimable()).to.equal(
      this.totalClaimable
    );
    expect(await this.tokenDistributor.claimPeriodStart()).to.equal(
      this.claimPeriodStart
    );
    expect(await this.tokenDistributor.claimPeriodEnd()).to.equal(
      this.claimPeriodEnd
    );
  });

  describe("Claim", function () {
    it("should revert when claiming before claim period starts", async function () {
      const pubKey = this.signers.admin.address;
      const json = TDParameters.json;

      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[pubKey].proofs, json[pubKey].amount)
      ).to.be.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_ClaimPeriodNotStarted"
      );
    });

    it("token distributor claim should work", async function () {
      await hre.network.provider.send("evm_increaseTime", [20]);
      await hre.network.provider.send("evm_mine");

      const pubKey = this.signers.admin.address;
      const json = TDParameters.json;

      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[pubKey].proofs, json[pubKey].amount)
      )
        .to.emit(this.tokenDistributor, "Claimed")
        .withArgs(pubKey, json[pubKey].amount);

      // check total amount decreases.
      expect(await this.tokenDistributor.totalClaimable()).to.equal(
        BigInt(this.totalClaimable) - BigInt(json[pubKey].amount)
      );
    });

    it("should revert because it can only claim once", async function () {
      await hre.network.provider.send("evm_increaseTime", [20]);
      await hre.network.provider.send("evm_mine");
      const pubKey = this.signers.admin.address;
      const json = TDParameters.json;

      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[pubKey].proofs, json[pubKey].amount)
      )
        .to.emit(this.tokenDistributor, "Claimed")
        .withArgs(
          pubKey,
          json[pubKey].amount
          // 0
        );

      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[pubKey].proofs, json[pubKey].amount)
      ).to.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_AlreadyClaimed"
      );
    });

    it("revert when claiming 0", async function () {
      await hre.network.provider.send("evm_increaseTime", [20]);
      await hre.network.provider.send("evm_mine");
      const pubKey = this.signers.admin.address;
      const json = TDParameters.json;

      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[pubKey].proofs, 0)
      ).to.reverted;
    });

    it("claimAndDelegate should work", async function () {
      await hre.network.provider.send("evm_increaseTime", [20]);
      await hre.network.provider.send("evm_mine");

      const erc20 = await this.token;
      const json = TDParameters.json;

      const fromAddress = await this.signers.admin.getAddress();
      const toAddress = await this.signers.notAuthorized.getAddress();

      const nonce = await erc20.nonces(fromAddress);

      const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours

      const chainId = hre.network.config.chainId || 31337;

      const signature = await signDelegateTransaction({
        contractAddress: await erc20.getAddress(),
        contractName: await erc20.name(),
        delegateeAddress: toAddress,
        chainId,
        nonce,
        expiry,
        signer: this.signers.admin,
      });

      const { v, r, s } = ethers.Signature.from(signature);

      // Get the balance of the address before claiming
      const initialBalance = await erc20.balanceOf(fromAddress);

      // Get the delegation status before claiming
      const isDelegatingBefore = (await erc20.getVotes(toAddress)) > 0;

      // Claim and delegate
      const claimAndDelegateTx = await this.tokenDistributor
        .connect(this.signers.admin)
        .claimAndDelegate(
          json[fromAddress].proofs,
          json[fromAddress].amount,
          toAddress,
          expiry,
          v,
          r,
          s
        );

      // Check if the Claimed event is emitted
      expect(claimAndDelegateTx)
        .to.emit(this.tokenDistributor, "Claimed")
        .withArgs(fromAddress, json[fromAddress].amount);

      // Check if the Delegated event is emitted
      expect(claimAndDelegateTx)
        .to.emit(this.tokenDistributor, "Delegated")
        .withArgs(toAddress, json[fromAddress].amount);

      // Get the balance of the address after claiming
      const finalBalance = await erc20.balanceOf(fromAddress);

      // Get the delegation status after claiming
      const isDelegatingAfter = BigInt(await erc20.getVotes(toAddress)) > 0;

      // Assert that the balance increased after claiming
      expect(finalBalance).to.be.equal(
        BigInt(initialBalance) + BigInt(json[fromAddress].amount)
      );

      // Assert that the address is now delegating
      expect(isDelegatingBefore).to.be.false;
      expect(isDelegatingAfter).to.be.true;
    });
  });

  describe("Withdrawn & Sweep", function () {
    it("should emit correct event when sweep works", async function () {
      const sweepReceiver = await this.signers.admin.getAddress();

      // Advance the chain in time by 1 day (86400 seconds) and some seconds.
      await hre.network.provider.send("evm_increaseTime", [86500]);
      await hre.network.provider.send("evm_mine");

      await expect(
        this.tokenDistributor.connect(this.signers.admin).sweep(sweepReceiver)
      ).to.emit(this.tokenDistributor, "Swept");
    });

    it("should revert when sweep is outside time range permited", async function () {
      const sweepReceiver = await this.signers.admin.getAddress();

      await expect(
        this.tokenDistributor.connect(this.signers.admin).sweep(sweepReceiver)
      ).to.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_ClaimPeriodNotEnded"
      );
    });

    it("should emit correct event when withdrawn works", async function () {
      // admin can withdrawn any amount
      const receiver = await this.signers.admin.getAddress();
      const MyERC20 = await ethers.getContractFactory("MyERC20");

      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .withdraw(receiver, 100)
      )
        .to.emit(this.tokenDistributor, "Withdrawn")
        .withArgs(receiver, 100);
    });

    it("should emit revert when withdrawning more then sufficient balance", async function () {
      // admin can withdrawn any amount
      const receiver = await this.signers.admin.getAddress();
      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .withdraw(receiver, TDParameters.totalClaimable + 1)
      ).to.revertedWithCustomError(this.token, "ERC20InsufficientBalance");
    });
  });

  describe("Merkle Tree Proofs", function () {
    it("should revert when claiming with an Merkle proof but for a different user or amount", async function () {
      await hre.network.provider.send("evm_increaseTime", [20]);
      await hre.network.provider.send("evm_mine");

      const pubKey = this.signers.admin.address;
      const json = TDParameters.json;

      // iterate and get second item on json
      const secondItem = Object.keys(json)[1];

      // diff proof
      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[secondItem].proofs, json[pubKey].amount)
      ).to.be.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_FailedMerkleProofVerify"
      );

      // diff amount
      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(json[pubKey].proofs, 100)
      ).to.be.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_FailedMerkleProofVerify"
      );
    });

    it("should revert when claiming with an invalid Merkle proof", async function () {
      await hre.network.provider.send("evm_increaseTime", [20]);
      await hre.network.provider.send("evm_mine");

      const pubKey = this.signers.admin.address;
      const json = TDParameters.json;

      // wrong proof
      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim(
            [
              "0x6323785e6857c4be0a156e055bf0790ba75655d200ccf955daac387b135af20d",
              "0x6b4be7d3c6e80226cdb83c1357b07063f385744759db01f3d993798745b3ef8c",
              "0x0e61eb273cb2b476a013d69b61fa162c47404736ad930086d3c9f21f2ad722d6",
              "0x13a7d9c6921c6a406e03f47526813f73690838a409475d6a2f2ea89ddcfba9e7",
              "0xb8834161a37e793afd1321526c665ed21b6919f7a7aae14a0d7ab834e2ac88c8",
              "0x29b94a6e2647951816c7bf1febc8f8f3b92fb5027b3f34a635db59d584bb3ce3",
            ],
            json[pubKey].amount
          )
      ).to.be.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_FailedMerkleProofVerify"
      );

      // empty proof
      await expect(
        this.tokenDistributor
          .connect(this.signers.admin)
          .claim([], json[pubKey].amount)
      ).to.be.revertedWithCustomError(
        this.tokenDistributor,
        "TokenDistributor_FailedMerkleProofVerify"
      );
    });
  });

  describe("Unauthorized", function () {
    it("should revert when unauthorized address calls sweep", async function () {
      const unauthorizedAddress = this.signers.notAuthorized.getAddress();
      await expect(
        this.tokenDistributor
          .connect(this.signers.notAuthorized)
          .sweep(unauthorizedAddress)
      ).to.be.revertedWithCustomError(this.tokenDistributor, "Unauthorized");
    });

    it("should revert when unauthorized address calls withdraw", async function () {
      const unauthorizedAddress = this.signers.notAuthorized.getAddress();

      await expect(
        this.tokenDistributor
          .connect(this.signers.notAuthorized)
          .withdraw(unauthorizedAddress, 10000000000n)
      ).to.be.revertedWithCustomError(this.tokenDistributor, "Unauthorized");
    });
  });
}

export function shouldNotDeploy(): void {
  describe("Should not deploy correctly", async function () {
    it("should revert when initializing the contract incorrectly on start end periods", async function () {
      this.loadFixture = loadFixture;

      const signers = await ethers.getSigners();
      const admin = signers[0];
      const { token } = await this.loadFixture(deployTokenFixture);
      this.token = token;

      this.root = TDParameters.root;
      this.totalClaimable = TDParameters.totalClaimable;
      this.claimPeriodStart = TDParameters.claimPeriodStart;
      this.claimPeriodEnd = TDParameters.claimPeriodStart;

      const TokenDistributor = await ethers.getContractFactory(
        "TokenDistributor"
      );
      await expect(
        TokenDistributor.connect(admin).deploy(
          TDParameters.root,
          token,
          TDParameters.totalClaimable,
          TDParameters.claimPeriodStart,
          TDParameters.claimPeriodStart,
          admin.address
        )
      ).to.be.revertedWithCustomError(TokenDistributor, "NotGreaterThan");
    });

    it("should revert when initializing the contract incorrectly totalClaimable as 0", async function () {
      this.loadFixture = loadFixture;

      const signers = await ethers.getSigners();
      const admin = signers[0];
      const { token } = await this.loadFixture(deployTokenFixture);
      this.token = token;

      this.root = TDParameters.root;
      this.totalClaimable = TDParameters.totalClaimable;
      this.claimPeriodStart = TDParameters.claimPeriodStart;
      this.claimPeriodEnd = TDParameters.claimPeriodStart;

      const TokenDistributor = await ethers.getContractFactory(
        "TokenDistributor"
      );
      await expect(
        TokenDistributor.connect(admin).deploy(
          TDParameters.root,
          token,
          0,
          TDParameters.claimPeriodStart,
          TDParameters.claimPeriodStart,
          admin.address
        )
      ).to.be.revertedWithCustomError(TokenDistributor, "NullAmount");
    });

    it("should revert when initializing the contract incorrectly totalClaimable is out of bounds", async function () {
      this.loadFixture = loadFixture;

      const signers = await ethers.getSigners();
      const admin = signers[0];
      const { token } = await this.loadFixture(deployTokenFixture);
      this.token = token;

      this.root = TDParameters.root;
      this.totalClaimable = TDParameters.totalClaimable;
      this.claimPeriodStart = TDParameters.claimPeriodStart;
      this.claimPeriodEnd = TDParameters.claimPeriodStart;

      const TokenDistributor = await ethers.getContractFactory(
        "TokenDistributor"
      );

      try {
        await TokenDistributor.connect(admin).deploy(
          TDParameters.root,
          token,
          115792089237316195423570985008687907853269984665640564039457584007913129639938n,
          TDParameters.claimPeriodStart,
          TDParameters.claimPeriodStart,
          admin.address
        );

        expect.fail("Expected an error, but none was thrown");
      } catch (error) {
        expect(error.code).to.equal("INVALID_ARGUMENT");
        expect(error.argument).to.equal("_totalClaimable");
        expect(error.value.toString()).to.equal(
          "115792089237316195423570985008687907853269984665640564039457584007913129639938"
        );
        expect(error.shortMessage).to.equal("value out-of-bounds");
      }
    });
  });
}
