import { ethers } from "hardhat";

import type { MyERC20 } from "../../types/contracts/MyERC20";
import type { TokenDistributor } from "../../types/contracts/TokenDistributor";
import * as TDParameters from "./TokenDistributor.param";

export async function deployTokenFixture(): Promise<{ token: MyERC20, }> {
  const signers = await ethers.getSigners();
  const admin = signers[0];
  const MyERC20 = await ethers.getContractFactory("MyERC20");
  const token = await MyERC20.connect(admin).deploy();
  await token.waitForDeployment();

  return { token };
}

export async function deployTokenDistributorFixture(token: string): Promise<{
  tokenDistributor: TokenDistributor;
}> {
  const signers = await ethers.getSigners();
  const admin = signers[0];

  const TokenDistributor = await ethers.getContractFactory("TokenDistributor");
  const tokenDistributor = await TokenDistributor.connect(admin).deploy(
    TDParameters.root,
    token,
    TDParameters.totalClaimable,
    TDParameters.claimPeriodStart,
    TDParameters.claimPeriodEnd,
    admin.address,
  );
  await tokenDistributor.waitForDeployment();

  return { tokenDistributor };
}
