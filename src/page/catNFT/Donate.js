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
} from "../../setting/accountSetting";
import kokoCatNFT from "../../artifacts/contracts/catNFT/kokoCatNFT.sol/kokoCatNFT.json";
import kokoToken from "../../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
async function Donate(
  kokoTokenAddress,
  catNFTAddress,
  tokenId,
  donateMinValue,
  donateValue
) {
  if (donateValue < donateMinValue) {
    alert(`捐赠金额小于最低要求：${donateMinValue} KO `);
    return false;
  } else {
    try {
      console.log(`------------donate-catNFT--------------`);
      // 初始化 RPC 提供器
      // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      // const account01 = new ethers.Wallet(PRIVATE_KEY0, provider);
      // 用 小狐狸 metamask
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const account01 = provider.getSigner();
      const account01Address = await account01.getAddress();
      console.log("account01 address:", account01Address);
      // 获取当前网络信息
      const network = await provider.getNetwork();
      console.log("Network : ", network);
      console.log("catNFTAddress:", catNFTAddress);
      console.log("kokoTokenAddress:", kokoTokenAddress);
      const catNFTContract = new ethers.Contract(
        catNFTAddress,
        kokoCatNFT.abi,
        account01
      );
      // 实例化合约
      const kokoTokenContract = new ethers.Contract(
        kokoTokenAddress,
        kokoToken.abi,
        account01
      );
      // // 获取 account01 的 kokoToken 余额

      // 获取 account01 的原生代币余额
      let account01NetworkBalance = await provider.getBalance(account01Address);
      console.log(
        "account01 钱包余额:",
        ethers.utils.formatUnits(account01NetworkBalance.toString(), 18) // 格式化为以太单位
      );
      // koko 币余额
      let account01KokoBalance = await kokoTokenContract.balanceOf(
        account01Address
      );
      console.log(
        "account01 koko Balance:",
        ethers.utils.formatUnits(account01KokoBalance.toString(), 18) // 格式化为以太单位
      );

      let catNFTContractBalance = await kokoTokenContract.balanceOf(
        catNFTContract.address
      );
      console.log("catNFTContractBalance:", catNFTContractBalance);
      // 开始进行捐赠操作
      // 将 donateValue 转换为 BigNumber 类型（单位为 wei）
      const donateValueInWei = ethers.utils.parseUnits(
        donateValue.toString(),
        18
      ); // 转换为 wei 单位
      // console.log("donateValueInWei:", donateValueInWei.toString());

      try {
        const transfer = await kokoTokenContract
          .connect(account01)
          .approve(catNFTContract.address, donateValueInWei, {
            gasLimit: 500000,
          });
        const response = await transfer.wait();
        console.log("response successful:", response);

        account01KokoBalance = await kokoTokenContract.balanceOf(
          account01Address
        );
        console.log(
          "account01 koko Balance:",
          ethers.utils.formatUnits(account01KokoBalance.toString(), 18) // 格式化为以太单位
        );
      } catch (error) {
        console.error("Error during transfer:", error);
      }
      catNFTContractBalance = await kokoTokenContract.balanceOf(
        catNFTContract.address
      );
      console.log(
        "after transfer,catNFTContractBalance:",
        catNFTContractBalance
      );
      const denate = await catNFTContract.donate(tokenId, donateValueInWei, {
        gasLimit: 500000,
      });

      // 等待捐赠交易完成
      const receipt = await denate.wait();

      console.log("捐赠后--------------------");
      // 查询捐赠后 account01 的原生代币余额
      account01NetworkBalance = await provider.getBalance(account01Address);
      console.log(
        "account01 钱包余额:",
        ethers.utils.formatUnits(account01NetworkBalance.toString(), 18)
      );

      return true;
    } catch (error) {
      console.error("捐赠 失败：", error);
      alert("捐赠失败，请检查控制台日志！");
    }

    // // setdonateLoading(true); // 开始加载状态
    // console.log(`------------donate-catNFT--------------`);
    // // 初始化 RPC 提供器
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    // const account01 = new ethers.Wallet(PRIVATE_KEY0, provider);
    // // await window.ethereum.request({
    // //   method: "eth_requestAccounts",
    // // });
    // // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // // const account01 = provider.getSigner();
    // const account01Address = await account01.getAddress();
    // console.log("account01 address:", account01Address);
    // // 获取当前网络信息
    // const network = await provider.getNetwork();
    // console.log("Network : ", network);
    // // // 获取 account01 的原生代币余额
    // // let account01NetworkBalance = await provider.getBalance(account01Address);
    // // console.log(
    // //   "account01 钱包余额:",
    // //   ethers.utils.formatUnits(account01NetworkBalance.toString(), 18) // 格式化为以太单位
    // // );

    // // // 获取 account01 的 kokoToken 余额
    // let account01KokoBalance = await kokoTokenContract.balanceOf(
    //   account01Address
    // );
    // console.log(
    //   "account01 koko Balance:",
    //   ethers.utils.formatUnits(account01KokoBalance.toString(), 18) // 格式化为以太单位
    // );

    // // // 获取指定 tokenId 的当前捐赠总额
    // // let donateTotalBalance = await catNFTContract.catsAmount(tokenId);
    // // let donateTotal = ethers.utils.formatUnits(donateTotalBalance, 18); // 格式化为以太单位
    // // console.log("donate Total 余额: ", donateTotal, "个 KO");

    // // 将 donateValue 转换为 BigNumber 类型（单位为 wei）
    // const donateValueInWei = ethers.utils.parseUnits(
    //   donateValue.toString(),
    //   18
    // ); // 转换为 wei 单位
    // console.log("donateValueInWei:", donateValueInWei.toString());

    // // 授权 catNFTContract 转账指定数量的 kokoToken
    // // const approveTx = await kokoTokenContract
    // //   .connect(account01)
    // //   .approve(catNFTContract.address, donateValueInWei, {
    // //     gasLimit: 500000,
    // //   });
    // // const response = await approveTx.wait(); // 等待授权交易完成
    // let catNFTContractBalance = await kokoTokenContract.balanceOf(
    //   catNFTContract.address
    // );
    // console.log("catNFTContractBalance:", catNFTContractBalance);
    // // 开始进行捐赠操作
    // const transaction = await catNFTContract
    //   .connect(account01)
    //   .donate(tokenId, donateValueInWei, {
    //     gasLimit: 500000,
    //   });

    // // 等待捐赠交易完成
    // const receipt = await transaction.wait();

    // console.log("捐赠后--------------------");

    // catNFTContractBalance = await kokoTokenContract.balanceOf(
    //   catNFTContract.address
    // );
    // console.log("catNFTContractBalance:", catNFTContractBalance);
    // // 查询捐赠后指定 tokenId 的总捐赠额
    // // donateTotalBalance = await catNFTContract.catsAmount(tokenId);
    // // donateTotal = ethers.utils.formatUnits(donateTotalBalance, 18); // 格式化为以太单位
    // // console.log("捐赠后,donate Total 余额: ", donateTotal, "个 KO");

    // // // 查询捐赠后 account01 的原生代币余额
    // // account01NetworkBalance = await provider.getBalance(account01Address);
    // // console.log(
    // //   "account01 钱包余额:",
    // //   ethers.utils.formatUnits(account01NetworkBalance.toString(), 18)
    // // );

    // // // 查询捐赠后 account01 的 kokoToken 余额
    // // account01KokoBalance = await kokoTokenContract.balanceOf(account01Address);
    // // console.log(
    // //   "account01 koko余额:",
    // //   ethers.utils.formatUnits(account01KokoBalance.toString(), 18)
    // // );

    // // setdonateLoading(false); // 结束加载状态

    // return true; // 返回捐赠成功的标志
  }
}

export default Donate;
