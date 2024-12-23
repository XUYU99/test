import { ethers } from "ethers";
import { moveBlocks, xytGovernorContract, BoxContract } from "./01-deploy.js";
import { calldata, description, proposeLog } from "./02-propose.js";
import kokoToken from "../../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
import TimeLock from "../../artifacts/contracts/kokoDao/TimeLock.sol/TimeLock.json";
import xytGovernor from "../../artifacts/contracts/kokoDao/xytGovernor.sol/xytGovernor.json";
import Box from "../../artifacts/contracts/kokoDao/Box.sol/Box.json";
import {
  RPC_URL,
  PRIVATE_KEY0,
  HARDHAT_RPC_URL,
} from "../../setting/accountSetting.js";

/**
 * 执行提案
 * @param {string} executeProposalIdInput
 */
async function execute(executeProposalIdInput) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerAddress = signer.address;
  const xytGovernorContract = new ethers.Contract(
    "0x244627603B7a0D0036f2B1764a7CEc2431c8FA54",
    xytGovernor.abi,
    provider
  );
  const BoxContract = new ethers.Contract(
    "0x35f84DFdBd89c0A584631ab8A82C5257351F57Ed",
    Box.abi,
    provider
  );
  // 初始化 provider 和 signer
  // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  // const signer = new ethers.Wallet(PRIVATE_KEY0, provider);

  console.log("执行提案Id: ", executeProposalIdInput);
  let value = await BoxContract.retrieve();
  console.log(`Box 合约的值为: ${value}`);

  // 通过输入的 executeProposalId 来查找 proposal 的信息
  const proposaldetail = getProposalDetails(executeProposalIdInput);
  const targets = proposaldetail.targets;
  const values = proposaldetail.values;
  const calldatas = proposaldetail.calldatas;
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(proposaldetail.description)
  );

  // 将提案添加到队列中
  const queueTx = await xytGovernorContract
    .connect(signer)
    .queue(targets, values, calldatas, descriptionHash);
  await queueTx.wait(1);
  console.log("提案已加入队列");

  // 推进区块链状态，确保满足时间锁条件
  // await moveBlocks(3);

  // 执行提案
  const executeTx = await xytGovernorContract.execute(
    proposaldetail.targets,
    proposaldetail.values,
    proposaldetail.calldatas,
    descriptionHash
  );
  await executeTx.wait(1);
  console.log("提案执行完毕");

  // 检查目标合约状态
  value = await BoxContract.retrieve();
  console.log(`执行后 Box 合约的值为: ${value}`);
  return true;
}

/**
 * 根据 proposalId 查找提案信息
 * @param {string} proposalId - 提案的 ID
 * @returns {object} 包含 targets, values, calldatas 的提案信息；如果未找到返回 null
 */
function getProposalDetails(proposalId) {
  const proposal = proposeLog.find((log) => log.proposalId === proposalId);

  if (proposal) {
    return {
      targets: proposal.targets,
      values: proposal.values,
      calldatas: proposal.calldatas,
      description: proposal.description,
    };
  } else {
    console.log(`未找到 proposalId 为 ${proposalId} 的提案`);
    return null; // 如果未找到，返回 null
  }
}
export default execute;
