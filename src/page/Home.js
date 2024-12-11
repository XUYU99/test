// Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
  ChakraBaseProvider,
  Box,
  Text,
  Input,
  Button,
  Flex,
  Spacer,
} from "../setting/component";
import {
  RPC_URL,
  PRIVATE_KEY0,
  HARDHAT_RPC_URL,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../setting/accountSetting";
import NavBar from "./00-NavBar";
import deployNFT, {
  kokoTokenContract,
  catNFTContract,
  metadataArrary,
  tokenIdArrary,
} from "../scripts/CatNFT/deployNFT";
import NFTDetail from "./catNFT/catNFT-detail";
import kokoCatNFT from "../artifacts/contracts/catNFT/kokoCatNFT.sol/kokoCatNFT.json";

function Home({ accounts, setAccounts }) {
  const navigate = useNavigate(); // 初始化 useNavigate，用于页面跳转
  const [kokoTokenContract, setkokoTokenContract] = useState(null);
  const [catNFTContract, setcatNFTContract] = useState(null);
  const [catNFTproperties, setcatNFTproperties] = useState([]);
  const [property, setSelectedProperty] = useState({});
  const [toggle, setToggle] = useState(false); // catNFT Property detail 窗口
  var provider;
  provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  // 点击 Mint 按钮时跳转到 /Mint 页面
  const mintClick = () => {
    navigate("/Mint");
  };
  // 点击 koko 按钮时跳转到 /Koko 页面
  const joinClick = () => {
    navigate("/Koko");
  };

  async function deployCatNFT_Onclick() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const deployNFTReturn = await deployNFT(); // 调用部署函数
        setkokoTokenContract(deployNFTReturn[0]);
        setcatNFTContract(deployNFTReturn[1]);
        console.log("部署成功～～;", deployNFTReturn);
        // alert("NFT 部署成功！"); // 部署成功提示
      } catch (error) {
        console.error("部署失败：", error);
        alert("部署失败，请检查控制台日志！");
      }
      // await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      alert("MetaMask 未安装，请先安装 MetaMask！");
    }
  }

  // 切换弹出框的状态，并设置当前选中的资产信息
  const togglePop = (property) => {
    setSelectedProperty(property); // 设置选中的房产信息
    setToggle(!toggle); // 切换弹出框状态（显示/隐藏）
  };

  // 点击按钮时手动调用加载区块链数据函数
  function loadBlockchainDataOnclick() {
    loadBlockchainData(); // 调用主加载函数
  }

  const getBalanceOnclick = async () => {
    const network = await provider.getNetwork();
    console.log("Network : ", network);
    const catNFTContractAddress = "0x1f3c949c986b7fdD5e7CfB6836a3b457331626e8";
    const catNFTContract = new ethers.Contract(
      catNFTContractAddress,
      kokoCatNFT.abi,
      provider
    );
    const account01 = new ethers.Wallet(PRIVATE_KEY0, provider);
    let getBalanceAddress = "0x1f3c949c986b7fdD5e7CfB6836a3b457331626e8";
    let balance = await provider.getBalance(getBalanceAddress);
    console.log(
      getBalanceAddress,
      " balance :",
      ethers.utils.formatUnits(balance.toString(), 18)
    );

    const contractBalance = await provider.getBalance(catNFTContract.address);
    console.log(
      "Contract Balance (ETH):",
      ethers.utils.formatEther(contractBalance)
    );

    // 使用合约的 withdraw 函数取出余额
    const withdrawTx = await catNFTContract.withdraw(
      ethers.utils.parseEther("2"), // 提取金额
      "0xe409121c12E6d748d29c132BE68552Bdc8162a81" // 提取目标地址
    );
    await withdrawTx.wait();
    console.log("Withdrawal successful");

    balance = await provider.getBalance(getBalanceAddress);
    console.log(
      "after withdraw,",
      getBalanceAddress,
      " balance :",
      ethers.utils.formatUnits(balance.toString(), 18)
    );
  };

  async function loadBlockchainData() {
    const network = await provider.getNetwork();
    console.log("Network : ", network);
    // sepolia 版本
    const kokoTokenAddress = "0x424bbdA9cF5d1e238ade4b8CDFd7FF55A8f9F928";
    const kokoTokenContract = new ethers.Contract(
      kokoTokenAddress,
      kokoCatNFT.abi,
      provider
    );
    setkokoTokenContract(kokoTokenContract);
    const catNFTContractAddress = "0x1f3c949c986b7fdD5e7CfB6836a3b457331626e8";
    const catNFTContract = new ethers.Contract(
      catNFTContractAddress,
      kokoCatNFT.abi,
      provider
    );
    setkokoTokenContract(kokoTokenContract);
    setcatNFTContract(catNFTContract);

    const catNFTproperties = [];
    const totalSupply = await catNFTContract.getTotalMintSupply();
    console.log("totalSupply", totalSupply.toString());
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      // 请求 URI 获取猫猫元数据
      const tokenUrljson = await catNFTContract.tokenURI(tokenId);
      const response = await fetch(tokenUrljson);
      const metadata = await response.json();
      const name = metadata.name;
      const image = metadata.image;
      // 获取 猫猫的捐款总额
      catNFTproperties.push({
        tokenId: tokenId,
        name: name,
        image: image,
        attributes: metadata.attributes,
      });
    }
    setcatNFTproperties(catNFTproperties);
    console.log("catNFTproperties", catNFTproperties);
  }

  return (
    <div>
      {" "}
      <div className="home">
        {/* 导航栏组件，显示账户相关信息 */}
        <NavBar accounts={accounts} setAccounts={setAccounts} />
        <ChakraBaseProvider>
          <div className="home_header">
            <Flex
              justify="center" // 水平居中
              align="center" // 垂直居中
              // height="80vh" // 设定容器高度为视口的 80%
              // paddingBottom="100px" // 下方留白
            >
              <Box width="520px">
                {/* 欢迎标题 */}
                <Box id="welcome title" className="home_welcometitle">
                  koko World
                </Box>
                {/* 按钮部分 */}
                <div id="init">
                  <Flex
                    id="init-input"
                    align="center" // 垂直居中
                    justify="center" // 水平居中
                    padding="10px"
                    margin="20px"
                  >
                    <button onClick={deployCatNFT_Onclick}>Deploy NFT</button>
                    <button onClick={loadBlockchainDataOnclick}>Reflesh</button>
                    <button onClick={getBalanceOnclick}>getBalance</button>
                  </Flex>
                </div>
              </Box>
            </Flex>
          </div>
          <h3 className="title">Properties For Donation</h3> <hr />
          <div className="properties-container">
            <div className="cards-container">
              {catNFTproperties.map((property) => (
                <div
                  key={property.tokenId}
                  className="card-wrapper"
                  onClick={() => togglePop(property)}
                >
                  <div className="card">
                    <div className="card-title">
                      <h2>{property.name}</h2>
                    </div>{" "}
                    <div className="card-image">
                      <img src={property.image} />
                    </div>
                  </div>{" "}
                  <div className="card_info">
                    <p>
                      <strong>Chip ID: {property.attributes[0]?.value}</strong>
                    </p>
                    <p>
                      Age:{property.attributes[2]?.value}
                      {/* sex:<strong>{property.attributes[3]?.value} </strong>
                      Breed:<strong>{property.attributes[4]?.value} </strong> */}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {toggle && (
            <NFTDetail
              provider={provider}
              kokoTokenContract={kokoTokenContract}
              catNFTContract={catNFTContract}
              property={property}
              togglePop={togglePop}
              loadBlockchainData={loadBlockchainData}
            />
          )}
        </ChakraBaseProvider>{" "}
      </div>
    </div>
  );
}

export default Home;
