import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./kokodao.css";
import {
  RPC_URL,
  PRIVATE_KEY0,
  HARDHAT_RPC_URL,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../../setting/accountSetting";
import kokoToken from "../../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
import TimeLock from "../../artifacts/contracts/kokoDao/TimeLock.sol/TimeLock.json";
import xytGovernor from "../../artifacts/contracts/kokoDao/xytGovernor.sol/xytGovernor.json";
import { voteLog } from "../../scripts/kokoDao/03-vote"; // 引入投票日志
import { moveBlocks } from "../../scripts/kokoDao/01-deploy"; // 引入 moveBlocks 函数

const ProposalData = ({ xytGovernorAddress }) => {
  const navigate = useNavigate();

  // 跳转到提案详情页面
  const proposalDetailClick = () => {
    navigate("/ProposalDetail");
  };

  // 使用 React 的状态钩子存储
  const [proposalDataList, setProposalDataList] = useState([]); // 提案数据列表状态
  const [refreshFlag, setRefreshFlag] = useState(false); // 刷新标志

  async function refreshOnclick() {
    await getProposalData();
  }
  // 获取所有的 proposal 数据
  async function getProposalData() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    // const xytGovernorAddress = "0xA4899D35897033b927acFCf422bc745916139776";
    const xytGovernorContract = new ethers.Contract(
      xytGovernorAddress,
      xytGovernor.abi,
      provider
    );
    // 获取 dao 治理合约所使用的 token 的地址
    // const tokenAddress = await xytGovernorContract.token();
    // console.log("tokenAddress: ", tokenAddress);

    const allProposals = await xytGovernorContract.getAllProposals();
    // console.log("allProposals: ", allProposals.toString());
    // 初始化提案数组
    var proposalArray = [];
    // 获取当前时间戳（秒）
    const nowTimestamp = Math.floor(Date.now() / 1000);
    // 循环处理每个proposal
    for (let i = 0; i < allProposals.length; i++) {
      // 判断提案状态
      const isPollEnded =
        allProposals[i].voteStart + allProposals[i].voteDuration < nowTimestamp;
      // 获取提案投票情况
      const proposalVotes = await xytGovernorContract.proposalVotes(
        allProposals[i].proposalId
      );
      const totalVotes = proposalVotes.abstainVotes
        .add(proposalVotes.againstVotes)
        .add(proposalVotes.forVotes);
      // console.log("totalVotes: ", totalVotes.toString()); // 获取总投票数

      // 设置提案数据
      const proposal = {
        proposalId: allProposals[i].proposalId.toString(), // 提案id
        proposer: allProposals[i].proposer, // 提案者
        voteStart: new Date(allProposals[i].voteStart * 1000).toLocaleString(), // 开始时间，，并转换为年月日格式
        voteDuration: allProposals[i].voteDuration, // 持续时间（单位：秒）
        executed: allProposals[i].executed, // 是否执行
        canceled: allProposals[i].canceled, // 是否取消
        etaSeconds: allProposals[i].etaSeconds, // 时间锁秒数
        voteEnd: new Date(
          (allProposals[i].voteStart + allProposals[i].voteDuration) * 1000
        ).toLocaleString(), // 结束时间（开始时间 + 持续时间），并转换为年月日格式
        targets: allProposals[i].targets,
        values: allProposals[i].values,
        calldatas: allProposals[i].calldatas,
        description: allProposals[i].description,
        isPollEnded: isPollEnded,
        // 投票情况，处理成百分比
        forVotes:
          totalVotes > 0
            ? ((proposalVotes.forVotes / totalVotes) * 100).toFixed(1)
            : "0.0",
        abstainVotes:
          totalVotes > 0
            ? ((proposalVotes.abstainVotes / totalVotes) * 100).toFixed(1)
            : "0.0",
        againstVotes:
          totalVotes > 0
            ? ((proposalVotes.againstVotes / totalVotes) * 100).toFixed(1)
            : "0.0",
      };
      // 将提案数据放入 提案数组 中
      proposalArray.push(proposal);
    }
    // 循环处理完所有提案后，放入 ProposalDataList
    setProposalDataList(proposalArray);
    // 刷新页面
    setRefreshFlag(true);
  }
  // 根据刷新标志更新提案数据列表;
  useEffect(() => {
    getProposalData();
  }, [refreshFlag]); // 每次刷新标志变化时触发

  // 定时每 5 秒更新一次刷新标志
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRefreshFlag((prevFlag) => !prevFlag); // 切换刷新标志
  //   }, 5000);

  //   return () => clearInterval(interval); // 清除定时器，防止内存泄漏
  // }, []);

  // moveBlocks 的按钮点击事件
  async function moveBlocksOnclick() {
    await moveBlocks(1);
  }

  return (
    <div>
      <div className="proposal-container">
        <div className="proposal_card_list">
          {proposalDataList.map((proposalData) => {
            // const { support, oppose, abstain } = getSupportStatistics();
            // const votes = { support: 20, oppose: 20, abstain: 30 };
            // const { support, oppose, abstain } = votes;
            return (
              <div key={proposalData.proposalId} className="proposal-card">
                <p className="proposal-timestamp">{proposalData.voteStart}</p>

                <button className="proposal-description-btn">
                  {proposalData.description}
                </button>

                <p className="proposal-id">
                  Proposal ID: {proposalData.proposalId}
                </p>
                <div className="proposal-status">
                  <span
                    className={`proposal-status ${
                      proposalData.isPollEnded
                        ? "poll-ended"
                        : "poll-in-progress"
                    }`}
                  >
                    {proposalData.isPollEnded ? "⏰ POLL ENDED" : "🕒 POLLING"}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-support"
                    style={{ width: `${proposalData.forVotes}%` }}
                  ></div>
                  <div
                    className="progress-bar-abstain"
                    style={{
                      width: `${proposalData.abstain}%`,
                      left: `${proposalData.forVotes}%`,
                    }}
                  ></div>
                  <div
                    className="progress-bar-oppose"
                    style={{ width: `${proposalData.againstVotes}%` }}
                  ></div>
                </div>

                <div className="support-statistics">
                  <p className="support-statistics-text">
                    Support {proposalData.forVotes}%
                  </p>
                  <p className="support-statistics-text">
                    Abstain {proposalData.abstainVotes}%
                  </p>
                  <p className="support-statistics-text">
                    Oppose {proposalData.againstVotes}%
                  </p>
                </div>
                <p className="transaction-targets-btn">
                  {/* Transaction Hash:{" "}
                  {proposalData.transactionHash
                    ? proposalData.transactionHash.slice(0, 5) + "..."
                    : ""} */}
                  Targets: {proposalData.targets}
                </p>
              </div>
            );
          })}
        </div>
        <div className="refresh_moveblock">
          <button className="refresh-btn" onClick={refreshOnclick}>
            Refresh
          </button>

          <button className="refresh-btn" onClick={moveBlocksOnclick}>
            moveBlocks
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalData; // 导出 ProposalData 组件
