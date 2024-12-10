// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 引入 OpenZeppelin 提供的治理相关模块
import "../openzeppelin/governance/Governor.sol";
import "../openzeppelin/governance/extensions/GovernorSettings.sol";
import "../openzeppelin/governance/extensions/GovernorCountingSimple.sol";
import "../openzeppelin/governance/extensions/GovernorVotes.sol";
import "../openzeppelin/governance/extensions/GovernorVotesQuorumFraction.sol";
import "../openzeppelin/governance/extensions/GovernorTimelockControl.sol";
import "hardhat/console.sol";

// xytGovernor 是一个治理合约，继承自 OpenZeppelin 提供的多个模块
contract xytGovernor is
    Governor,
    GovernorSettings, // 用于设置投票延迟、投票周期和提案门槛
    GovernorCountingSimple, // 简单投票计数规则
    GovernorVotes, // 支持基于投票代币的投票权分配
    GovernorVotesQuorumFraction, // 定义投票通过的最低投票比例
    GovernorTimelockControl // 支持提案的时间锁定机制
{
    // 构造函数，用于初始化治理合约
    constructor(
        IVotes _token, // 投票代币
        TimelockController _timelock, // 时间锁控制合约
        uint48 _votingDelay, // 投票延迟（以区块为单位）
        uint32 _votingPeriod, // 投票周期（以区块为单位）
        uint256 _proposalThreshold // 提案门槛
    )
        Governor("MyGovernor") // 初始化治理合约名称
        GovernorSettings(
            _votingDelay, // 设置投票延迟
            _votingPeriod, // 设置投票周期
            _proposalThreshold // 设置提案门槛
        )
        GovernorVotes(_token) // 设置投票代币
        GovernorVotesQuorumFraction(6) // 设置最低投票通过比例为 6%
        GovernorTimelockControl(_timelock) // 设置时间锁定控制合约
    {}

    // 以下函数是 Solidity 要求的覆盖函数
    // 它们确保合约可以正确地结合多个父类的功能

    // 返回投票延迟
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    // 返回投票周期
    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    // 返回在特定区块号的最低投票通过比例
    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // 返回特定提案的状态
    function state(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    // 提交新的提案
    function propose(
        address[] memory targets, // 要执行的目标地址
        uint256[] memory values, // 要发送的金额
        bytes[] memory calldatas, // 要调用的函数及参数
        string memory description // 提案的描述
    ) public override(Governor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    // 判断提案是否需要排队等待执行
    function proposalNeedsQueuing(
        uint256 proposalId
    ) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    // 返回提案门槛，即发起提案需要的最低投票权
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    // 内部函数：将提案加入执行队列
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return
            super._queueOperations(
                proposalId,
                targets,
                values,
                calldatas,
                descriptionHash
            );
    }

    // 内部函数：执行提案
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    // 执行提案（公开函数）
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable virtual override(Governor) returns (uint256) {
        return super.execute(targets, values, calldatas, descriptionHash);
    }

    // 内部函数：取消提案
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    // 返回执行者地址
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
