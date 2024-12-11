import React, { useState } from "react";
import { ethers } from "ethers";

import {
  contractArray,
  kokoTokenContract,
  TimeLockContract,
  xytGovernorContract,
  BoxContract,
  moveBlocks,
} from "./01-deploy.js";
import kokoToken from "../../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
import TimeLock from "../../artifacts/contracts/kokoDao/TimeLock.sol/TimeLock.json";
import xytGovernor from "../../artifacts/contracts/kokoDao/xytGovernor.sol/xytGovernor.json";
import Box from "../../artifacts/contracts/kokoDao/Box.sol/Box.json";
export var proposeLog = []; // 存储所有提案信息
export var proposalId, description, calldata;

/**
 * 提出提案
 */
async function propose(targetAddress, proposalDescription) {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();
  const xytGovernorContract = new ethers.Contract(
    "0x244627603B7a0D0036f2B1764a7CEc2431c8FA54",
    xytGovernor.abi,
    provider
  );
  const BoxContract = new ethers.Contract(targetAddress, Box.abi, provider);

  console.log(`--------------02-propose----------------`);

  // 设置提案参数
  calldata = BoxContract.connect(signer).interface.encodeFunctionData("store", [
    488,
  ]);
  console.log("目标合约地址11: ", BoxContract.address, "calldata: ", calldata);

  const targets = [targetAddress];
  const values = [0]; // 交易价值，设置为 0
  const calldatas = [calldata];
  description = proposalDescription.toString();

  console.log("xytGovernorContract 地址: ", xytGovernorContract.address);

  try {
    // 提案交易
    const proposeTx = await xytGovernorContract
      .connect(signer)
      .propose(targets, values, calldatas, description);

    // 等待交易完成并获取提案 ID
    const proposeReceipt = await proposeTx.wait();
    const plog = xytGovernorContract.interface.parseLog(proposeReceipt.logs[0]);
    proposalId = plog.args.proposalId.toString();

    const timestamp = new Date().toISOString();

    // 构造提案数据并存储到日志中
    const proposeArray = {
      timestamp,
      description,
      proposalId,
      transactionHash: proposeTx.hash,
      targets,
      values,
      calldatas,
    };
    proposeLog.push(proposeArray);

    console.log(`提案 proposalId: ${proposalId}`);

    // 加快区块进度
    // await moveBlocks(2);

    // 获取提案状态:  0 Pending,1 Active,2 Canceled,3 Defeated,4 Succeeded,5 Queued,6 Expired,Executed
    const proposalState = await xytGovernorContract.state(proposalId);
    console.log(`提案状态: ${proposalState}`);
    if (proposalState) {
      console.log(`提案创建成功！提案内容: ${description}`);
      return true;
    } else {
      console.error(`提案创建失败！`);
      return false;
    }
  } catch (error) {
    console.error("提案过程中出现错误: ", error);
  }
}

export default propose;
