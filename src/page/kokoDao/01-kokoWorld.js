// Koko.js
import React, { useState } from "react";
import {
  ChakraBaseProvider,
  div,
  Text,
  Input,
  Button,
  Flex,
  Spacer,
} from "../../setting/component"; // 导入 Chakra UI 组件
import NavBar from "../00-NavBar";
import deploy from "../../scripts/kokoDao/01-deploy";
import propose from "../../scripts/kokoDao/02-propose";
import vote from "../../scripts/kokoDao/03-vote";
import execute from "../../scripts/kokoDao/04-execute";
import ProposalData from "./proposalData";

/**
 * kokoWorld DAO 页面
 */
function Kokoworld({ accounts, setAccounts }) {
  // 定义状态变量，用于存储输入框的值
  const [inputValue1, setInputValue1] = useState(""); // 提案的执行地址
  const [inputValue2, setInputValue2] = useState("0"); // 提案的值
  const [inputValue3, setInputValue3] = useState("set proposal description"); // 提案描述

  const [proposalidInput, setproposalidInput] = useState(""); // 提案 ID 输入框值
  const [supportInput, setsupportInput] = useState("1"); // 投票支持选项
  const [accountNumberInput, setaccountNumberInput] = useState("0"); // 投票账户编号

  const [executeProposalIdInput, setexecuteProposalIdInput] = useState(""); // 执行提案 ID 输入框值
  async function checkMetaMask() {
    // 检查是否安装了 MetaMask
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask 插件未安装，请先安装 MetaMask！");
      return false;
    }
    try {
      // // 请求账户连接
      // const accounts = await window.ethereum.request({
      //   method: "eth_accounts",
      // });
      // if (accounts.length === 0) {
      //   // 未连接账户
      //   alert("尚未连接账户，请先连接账户！");
      //   return false;
      // } else {
      //   // 已连接账户
      //   console.log("MetaMask 已连接账户：", accounts[0]);
      //   return true;
      // }
    } catch (error) {
      console.error("检查 MetaMask 状态时出错：", error);
      alert("无法获取账户，请检查 MetaMask 设置！");
      return false;
    }
  }
  // 部署合约 的按钮点击事件
  async function deployOnclick() {
    const connectSuccess = await checkMetaMask();
    if (connectSuccess == false) return;
    try {
      // const success = await deploy(); // 调用部署函数
      // alert("部署成功！"); // 部署成功提示
    } catch (error) {
      console.error("部署失败：", error);
      alert("部署失败，请检查控制台日志！");
    }
  }

  async function proposeOnclick() {
    const connectSuccess = await checkMetaMask();
    if (connectSuccess == false) return;
    if (!inputValue1 || !inputValue3) {
      alert("提案的目标地址和描述不能为空！"); // 检查必填项
      return;
    }
    try {
      // const success = await propose(inputValue1, inputValue3); // 提案成功调用
      // alert(success ? "提案成功~~~" : "提案失败!!!");
    } catch (error) {
      console.error("提案失败：", error);
      alert("提案失败，请检查控制台日志！");
    }
  }
  // 投票 的按钮点击事件
  async function voteOnclick() {
    const connectSuccess = await checkMetaMask();
    if (connectSuccess == false) return;
    if (!proposalidInput || !supportInput || !accountNumberInput) {
      alert("提案 ID、支持选项和账户编号不能为空！"); // 显示警告
      return;
    }
    try {
      // const success = await vote(
      //   proposalidInput,
      //   supportInput,
      //   accountNumberInput
      // ); // 调用投票函数
      // alert(success ? "投票成功~~~" : "投票失败!!!");
    } catch (error) {
      console.error("投票失败：", error);
      alert("投票失败，请检查控制台日志！");
    }
  }

  // 执行提案 的按钮点击事件
  async function executeOnclick() {
    const connectSuccess = await checkMetaMask();
    if (connectSuccess == false) return;
    if (!executeProposalIdInput) {
      alert("执行提案 ID 不能为空！"); // 显示警告
      return;
    }
    try {
      // const success = await execute(executeProposalIdInput); // 调用执行函数
      // alert(success ? "执行成功~~~" : "执行失败!!!");
    } catch (error) {
      console.error("提案执行失败：", error);
      alert("提案执行失败，请检查控制台日志！");
    }
  }

  return (
    <div className="kokoDao">
      {/* 导航栏组件 */}
      <NavBar accounts={accounts} setAccounts={setAccounts} />
      <ChakraBaseProvider>
        <div className="kokoDao_container">
          <div className="kokoDao_proposallist">
            {/* 提案数据展示组件 */}
            <ProposalData />
          </div>
          <div className="kokoDao_operate">
            <div id="DAO_title" margin="auto">
              <Text fontSize="40px">kokoWorld DAO!!</Text>
              <Text
                fontSize="33px"
                letterSpacing="-5.5%" // 字间距
                fontFamily="VT323" // 字体
                textShadow="0 2px 2px #000000"
              >
                It's 2077, bala bala ...
              </Text>
            </div>
            <div className="kokoDao_deploy">
              {/* deploy 按钮 */}
              <button onClick={deployOnclick}>deploy</button>
            </div>
            {/* 提案部分 */}
            <div className="kokoDao_propose">
              <div className="propose-input">
                <input
                  type="text"
                  value={inputValue1}
                  onChange={(e) => setInputValue1(e.target.value)}
                  placeholder={"proposal exe"}
                ></input>
                <input
                  type="text"
                  value={inputValue2}
                  onChange={(e) => setInputValue2(e.target.value)}
                  placeholder={"proposal value"}
                ></input>
                <input
                  type="text"
                  defaultValue={inputValue3}
                  onChange={(e) => setInputValue3(e.target.value)}
                ></input>
              </div>
              <button id="propose-button" onClick={proposeOnclick}>
                propose
              </button>
            </div>
            {/* 投票部分 */}
            <div className="kokoDao_vote">
              <div className="propose-input">
                <input
                  type="text"
                  defaultValue={proposalidInput}
                  onChange={(e) => setproposalidInput(e.target.value)}
                  placeholder={"proposal Id"}
                ></input>
                <input
                  type="number"
                  defaultValue={supportInput}
                  onChange={(e) => setsupportInput(e.target.value)}
                  placeholder={"support"}
                ></input>
                <input
                  type="number"
                  defaultValue={accountNumberInput}
                  onChange={(e) => setaccountNumberInput(e.target.value)}
                  placeholder={"0"}
                ></input>
              </div>
              <button id="vote-button" onClick={voteOnclick}>
                vote
              </button>
            </div>
            {/* 执行部分 */}
            <div className="kokoDao_execute">
              <div className="execute-input">
                <input
                  type="text"
                  defaultValue={executeProposalIdInput}
                  onChange={(e) => setexecuteProposalIdInput(e.target.value)}
                  placeholder={"execute ProposalId"}
                ></input>
              </div>
              {/* 执行按钮 */}
              <button className="execute-button" onClick={executeOnclick}>
                execute
              </button>
            </div>
          </div>
        </div>
      </ChakraBaseProvider>
    </div>
  );
}

export default Kokoworld;
