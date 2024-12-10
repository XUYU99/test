// Mint.js
"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import {
  RPC_URL,
  PRIVATE_KEY0,
  HARDHAT_RPC_URL,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../setting/accountSetting";

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
    alert(`捐赠金额小于最低要求：${donateMinValue} KO `);
  } else {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const account01 = new ethers.Wallet(PRIVATE_KEY0, provider);
    const account01Address = account01.address;
    console.log("account01 address:", account01Address);
    console.log(`------------donate-catNFT--------------`);
    console.log("catNFTContract", catNFTContract);

    let donateTotalBalance = await catNFTContract.catsAmount(tokenId);
    let donateTotal = ethers.utils.formatUnits(donateTotalBalance, 18);
    console.log("donate Total 余额: ", donateTotal, "个 KO");
    // 将 donateValue 转换为 BigNumber 类型（单位为 wei）
    const donateValueInWei = ethers.utils.parseUnits(
      donateValue.toString(),
      18
    ); // 转换为 wei 单位
    console.log("donateValueInWei:", donateValueInWei.toString());

    // 先授权给catNFTContract，允许转kokoToken
    const approveTx = await kokoTokenContract
      .connect(account01)
      .approve(catNFTContract.address, donateValueInWei);
    const response = await approveTx.wait();

    // 开始进行捐赠操作
    const transaction = await catNFTContract
      .connect(account01)
      .donate(tokenId, donateValueInWei, {
        value: donateValueInWei, // 传递转账的金额（以 wei 为单位）
        gasLimit: 500000, // 设置 gas limit
      });

    // 等待交易完成
    const receipt = await transaction.wait();

    donateTotalBalance = await catNFTContract.catsAmount(tokenId);
    donateTotal = ethers.utils.formatUnits(donateTotalBalance, 18);
    console.log("捐赠后,donate Total 余额: ", donateTotal, "个 KO");
  }
}

export default Donate;
