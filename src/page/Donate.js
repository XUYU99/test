// Mint.js
"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import {
  PRIVATE_KEY0,
  HARDHAT_RPC_URL,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../setting/accountSetting";
import deployNFT, {
  kokoTokenContract,
  catNFTContract,
  metadataArrary,
  tokenIdArrary,
} from "../scripts/CatNFT/deployNFT";

async function Donate(
  kokoTokenContract,
  catNFTContract,
  tokenId,
  donateMinValue,
  donateValue
) {
  console.log("donateValue: ", donateValue);
  console.log("donateMinValue: ", donateMinValue);
  if (donateValue < donateMinValue) {
    alert(`捐赠金额小于最低要求：${donateMinValue} ETH `);
  } else {
    const provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC_URL);
    const donator = new ethers.Wallet(PRIVATE_KEY0, provider);
    const donatorAddress = donator.address;
    console.log("donator address:", donatorAddress);
    console.log(`------------donate-catNFT--------------`);
    console.log("catNFTContract", catNFTContract);

    let donateTotalBalance = await kokoTokenContract.balanceOf(donator);
    console.log("donate Total 余额: ", donateTotalBalance, "KOKO");
    // 获取捐赠金额，转化成 wei 单位
    const donateValueInWei = ethers.utils.parseUnits(
      donateValue.toString(),
      18
    );
    // 开始 donate

    const totalMintSupply = await catNFTContract
      .connect(donator)
      .totalMintSupply();
    console.log("totalMintSupply:", totalMintSupply);
    const transaction = await catNFTContract.connect(donator).donate(tokenId, {
      value: donateValueInWei,
      gasLimit: 500000,
    });
    const receipt = await transaction.wait();

    donateTotalBalance = await kokoTokenContract.balanceOf(donator);
    console.log("捐赠后, donate Total 余额: ", donateTotalBalance, "KOKO");
  }
}

export default Donate;
