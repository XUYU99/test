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
import { proposeLog } from "../../scripts/kokoDao/02-propose"; // 引入提案日志
import { voteLog } from "../../scripts/kokoDao/03-vote"; // 引入投票日志
import {
  moveBlocks,
  xytGovernorContract,
} from "../../scripts/kokoDao/01-deploy"; // 引入 moveBlocks 函数
// import kokoToken from "../../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
// import TimeLock from "../../artifacts/contracts/kokoDao/TimeLock.sol/TimeLock.json";
// import xytGovernor from "../../artifacts/contracts/kokoDao/xytGovernor.sol/xytGovernor.json";
// import Box from "../../artifacts/contracts/kokoDao/Box.sol/Box.json";

const ProposalData = () => {
  const navigate = useNavigate();

  // 使用 React 的状态钩子存储
  const [proposalDataList, setProposalDataList] = useState([]); // 提案数据列表状态
  const [refreshFlag, setRefreshFlag] = useState(false); // 刷新标志
  // const getProposalData = async () => {
  //   const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  //   const xytGovernorAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  //   const xytGovernorntract = new ethers.Contract(
  //     xytGovernorAddress,
  //     xytGovernor.abi,
  //     provider
  //   );
  //   const proposalArray = await xytGovernorContract.getAllProposals();
  // };

  // 统计提案支持情况
  const getSupportStatistics = (proposalId) => {
    // 筛选出当前提案的所有投票
    const proposalVotes = voteLog.filter(
      (vote) => vote.proposalId === proposalId
    );
    const totalVotes = proposalVotes.length; // 获取总投票数
    const supportStats = { oppose: 0, support: 0, abstain: 0 }; // 初始化支持统计

    // 统计支持、反对和弃权的投票数
    proposalVotes.forEach((vote) => {
      if (vote.support === "0") supportStats.oppose += 1;
      if (vote.support === "1") supportStats.support += 1;
      if (vote.support === "2") supportStats.abstain += 1;
    });

    // 计算支持、反对和弃权的百分比
    return {
      support:
        totalVotes > 0
          ? ((supportStats.support / totalVotes) * 100).toFixed(1)
          : "0.0",
      oppose:
        totalVotes > 0
          ? ((supportStats.oppose / totalVotes) * 100).toFixed(1)
          : "0.0",
      abstain:
        totalVotes > 0
          ? ((supportStats.abstain / totalVotes) * 100).toFixed(1)
          : "0.0",
    };
  };

  // 根据刷新标志更新提案数据列表
  useEffect(() => {
    setProposalDataList(proposeLog); // 将 proposeLog 更新到状态
  }, [refreshFlag]); // 每次刷新标志变化时触发

  // 定时每 5 秒更新一次刷新标志
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshFlag((prevFlag) => !prevFlag); // 切换刷新标志
    }, 5000);

    return () => clearInterval(interval); // 清除定时器，防止内存泄漏
  }, []);

  // moveBlocks 的按钮点击事件
  async function moveBlocksOnclick() {
    await moveBlocks(1);
  }

  return (
    <div>
      <div className="proposal-container">
        <div className="proposal_card_list">
          {proposalDataList.map((proposalData) => {
            const { support, oppose, abstain } = getSupportStatistics(
              proposalData.proposalId
            );

            return (
              <div key={proposalData.proposalId} className="proposal-card">
                <p className="proposal-timestamp">{proposalData.timestamp}</p>

                <button className="proposal-description-btn">
                  Proposal Description: {proposalData.description}
                </button>

                <p className="proposal-id">
                  Proposal ID: {proposalData.proposalId}
                </p>

                <p className="proposal-status">⏰ POLL ENDED</p>

                <div className="progress-bar">
                  <div
                    className="progress-bar-oppose"
                    style={{ width: `${oppose}%` }}
                  ></div>
                  <div
                    className="progress-bar-support"
                    style={{ width: `${support}%`, left: `${oppose}%` }}
                  ></div>
                  <div
                    className="progress-bar-abstain"
                    style={{ width: `${abstain}%` }}
                  ></div>
                </div>

                <div className="support-statistics">
                  <p className="support-statistics-text">Support {support}%</p>
                  <p className="support-statistics-text">Oppose {oppose}%</p>
                  <p className="support-statistics-text">Abstain {abstain}%</p>
                </div>

                <button className="transaction-hash-btn">
                  Transaction Hash:{" "}
                  {proposalData.transactionHash
                    ? proposalData.transactionHash.slice(0, 5) + "..."
                    : ""}
                </button>
              </div>
            );
          })}
        </div>
        <div className="refresh_moveblock">
          <button
            className="refresh-btn"
            onClick={() => setRefreshFlag((prevFlag) => !prevFlag)}
          >
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
