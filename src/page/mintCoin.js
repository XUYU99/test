"use client";
import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import {
  ChakraBaseProvider,
  Box,
  Text,
  Input,
  Button,
  Flex,
  Spacer,
} from "../setting/component";

import NavBar from "./00-NavBar";

import createToken from "../artifacts/contracts/kokoDao/createToken.sol/createToken.json";
// 声明全局变量以存储合约实例

const Mint = ({ accounts, setAccounts }) => {
  const [loading, setloading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Loading, please wait..."
  );
  // 使用 React 的状态钩子存储用户输入值
  const [mintAmount, setMintAmount] = useState(50); // 默认铸造数量
  const [name, setName] = useState("name"); // 默认 Token 名称
  const [symbol, setSymbol] = useState("symbol"); // 默认 Token 符号
  const [createTokenContract, setcreateTokenContract] = useState();

  // 部署 Token 合约
  async function deployToken() {
    if (window.ethereum) {
      setloading(true);
      // 检查是否连接了 MetaMask，并初始化 ethers 的 provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("mintCoin-initMint()-start");

      try {
        // // 使用合约工厂创建和部署合约
        // const tokenFactory = new ethers.ContractFactory(
        //   creatToken.abi,
        //   creatToken.bytecode,
        //   signer
        // );
        // const createTokenContract = await tokenFactory.deploy(
        //   name,
        //   symbol,
        //   signerAddress,
        //   signerAddress
        // );
        // await createTokenContract.deployed();
        // console.log("createTokenContract address:", createTokenContract.address);

        // 部署 createToken 合约
        const createTokenFactory = new ethers.ContractFactory(
          createToken.abi,
          createToken.bytecode,
          signer
        );
        const createTokenContract = await createTokenFactory.deploy(
          name,
          symbol,
          signerAddress,
          signerAddress
        );
        await createTokenContract.deployTransaction.wait();
        const createTokenAddress = createTokenContract.address;
        console.log(`createToken 合约 部署在 ${createTokenAddress}`);
        setcreateTokenContract(createTokenContract);
      } catch (err) {
        console.log("deploy mint contract error", err); // 捕获和输出错误
      } finally {
        setloading(false);
      }
    } else {
      alert("MetaMask 未连接 !!!!"); // 提示用户连接 MetaMask
    }
  }

  // 铸造币的函数
  async function handleMint() {
    if (window.ethereum) {
      setloading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      try {
        const mintAmountInWei = ethers.utils.parseUnits(
          mintAmount.toString(),
          18
        ); // 转换为 wei 单位
        // 调用合约 铸造币
        const mint = await createTokenContract
          .connect(signer)
          .mint(signerAddress, mintAmountInWei);
        const response = await mint.wait();
        console.log("handleMint()-response", response);
        // 查询余额
        const balance = await createTokenContract.balanceOf(signerAddress);
        console.log("user balance change to: ", balance.toString());
      } catch (err) {
        console.log("mint error", err); // 捕获和输出错误
      } finally {
        setloading(false);
      }
    } else {
      alert("MetaMask 未连接 !!!!");
    }
  }

  // 验证合约部署和铸造情况
  async function verifyContract() {
    setloading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    try {
      const balance = await createTokenContract.balanceOf(
        signerAddress // 测试地址
      );
      const name = await createTokenContract.name(); // 查询 Token 名称
      console.log(`token name:${name} ,user balance : ${balance}`); // 打印结果
    } catch (err) {
      console.log("verify mintContract balance error", err); // 捕获和输出错误
    } finally {
      setloading(false);
    }
  }

  // 减少铸造数量 的按钮点击事件
  const decreaseOnclick = () => {
    if (mintAmount <= 1) return; // 限制最小值为 1
    setMintAmount(mintAmount - 1); // 更新状态
  };

  // 增加铸造数量 的按钮点击事件
  const increaseOnclick = () => {
    if (mintAmount >= 200) return; // 限制最大值为 200
    setMintAmount(mintAmount + 1); // 更新状态
  };

  return (
    <div>
      {" "}
      <NavBar accounts={accounts} setAccounts={setAccounts} />
      {/* 弹窗显示加载 */}
      <div>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">{loadingMessage}</div>
          </div>
        )}
      </div>
      <ChakraBaseProvider>
        <Flex
          justify="center" // 居中对齐
          align="center" // 垂直居中
          height="100vh" // 占满整个视口高度
          paddingBottom="180px"
        >
          <Box width="520px">
            {/* 初始化合约部分 */}
            <div id="init-and-mint" className="mintpage">
              <div id="init">
                <Text fontSize="40px" padding="50px">
                  Mint Coin
                </Text>
                <Flex
                  id="init-input"
                  align="center"
                  justify="center"
                  padding="15px"
                  textColor="black"
                >
                  {/* 输入 Token 名称 */}
                  <Input
                    type="text"
                    defaultValue={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Token Name"
                  />

                  {/* 输入 Token 符号 */}
                  <Input
                    type="text"
                    defaultValue={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Token Symbol"
                  />
                </Flex>
                {/* 部署按钮 */}
                <Button id="init-deploy-button" onClick={deployToken}>
                  Init deploy token Contract
                </Button>
              </div>
              {/* 铸造币部分 */}
              <div id="mint">
                <Flex
                  id="mint-setAmount"
                  align="center"
                  justify="center"
                  padding="30px"
                  textColor="black"
                >
                  {/* 减少数量按钮 */}
                  <Button onClick={decreaseOnclick}>-</Button>
                  {/* 铸造数量输入框 */}
                  <Input
                    type="number"
                    value={mintAmount} // 动态绑定
                    onChange={(e) => setMintAmount(e.target.value)}
                  />
                  {/* 增加数量按钮 */}
                  <Button onClick={increaseOnclick}>+</Button>
                </Flex>
                {/* 铸造按钮 */}
                <Button id="mint-button" onClick={handleMint}>
                  Mint
                </Button>
                {/* 验证按钮 */}
                <Button onClick={verifyContract}>verify!</Button>
              </div>
            </div>
          </Box>
        </Flex>
      </ChakraBaseProvider>
    </div>
  );
};

export default Mint;
