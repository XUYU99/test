// Home.js
import React, { useState, useEffect } from "react";
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
} from "../scripts/deployNFT";
import NFTDetail from "./catNFT/catNFT-detail";
import kokoCatNFT from "../artifacts/contracts/catNFT/kokoCatNFT.sol/kokoCatNFT.json";

function Home({ accounts, setAccounts }) {
  const navigate = useNavigate(); // 初始化 useNavigate，用于页面跳转
  const [kokoTokenContract, setkokoTokenContract] = useState(null);
  const [catNFTContract, setcatNFTContract] = useState(null);
  const [catNFTproperties, setcatNFTproperties] = useState([]);
  const [property, setSelectedProperty] = useState({});
  const [toggle, setToggle] = useState(false); // catNFT Property detail 窗口
  // 弹窗显示加载
  const [loading, setloading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Loading, please wait..."
  );
  const [sourceloading, setsourceloading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false); // 定义刷新状态

  var provider;
  provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  async function deployCatNFT_Onclick() {
    if (typeof window.ethereum !== "undefined") {
      try {
        setloading(true);
        const deployNFTReturn = await deployNFT(); // 调用部署函数
        if (deployNFTReturn != null) {
          await refreshHomeOnclick();
          setloading(false);
          setkokoTokenContract(deployNFTReturn[0]);
          setcatNFTContract(deployNFTReturn[1]);
          console.log("部署成功～～;", deployNFTReturn);
        }
        setloading(false);
        // alert("NFT 部署成功！"); // 部署成功提示
      } catch (error) {
        setloading(false);
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

  // 加载页面button
  async function refreshHomeOnclick() {
    setLoadingMessage("Fetching data, please wait a moment...");
    try {
      setloading(true);
      setRefreshFlag((refreshFlag) => !refreshFlag);
      // const success = await kokoDaotest();
      setloading(false);
      // alert(success ? "刷新 home 页面 成功~~~" : "刷新 home 页面 失败!!!");
    } catch (error) {
      setloading(false);
      console.error("刷新 home 页面 失败：", error);
      alert("部署失败，请检查控制台日志！");
    }
  }

  const getBalanceOnclick = async () => {};

  async function refreshHome() {
    setloading(true);
    try {
      const network = await provider.getNetwork();
      console.log("Network : ", network);
      // sepolia 版本
      const catNFTContractAddress =
        "0xf894d6704d06491269c0600168Ec6C7E99f2E9a0";
      const catNFTContract = new ethers.Contract(
        catNFTContractAddress,
        kokoCatNFT.abi,
        provider
      );
      const kokoTokenAddress = await catNFTContract.kokoTokenAddress();
      const kokoTokenContract = new ethers.Contract(
        kokoTokenAddress,
        kokoCatNFT.abi,
        provider
      );
      setkokoTokenContract(kokoTokenContract);
      setcatNFTContract(catNFTContract);
      //hardhat 版本
      const catNFTproperties = [];
      const totalSupply = await catNFTContract.getTotalMintSupply();
      // console.log("totalSupply", totalSupply.toString());
      for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        // 请求 URI 获取猫猫元数据
        const tokenUrljson = await catNFTContract.tokenURI(tokenId);
        const response = await fetch(tokenUrljson);
        const metadata = await response.json();
        // 获取 猫猫的捐款总额
        catNFTproperties.push({
          tokenId: tokenId,
          name: metadata.name,
          image: metadata.image,
          attributes: metadata.attributes,
        });
      }
      setcatNFTproperties(catNFTproperties);
      console.log("catNFTproperties", catNFTproperties);
      console.log("刷新页面成功～～");
      return true;
    } catch (error) {
      alert(`刷新页面失败！`);
    } finally {
      setloading(false);
    }
  }
  // 加载数据
  // useEffect(() => {
  //   setRefreshFlag2((refreshFlag2) => !refreshFlag2);
  //   refreshHomeOnclick();
  // }, []);

  useEffect(() => {
    // console.log("Home Page-useEffect()");
    refreshHome();
  }, [refreshFlag]); // 每次刷新标志变化时触发
  return (
    <div>
      {sourceloading && (
        <div className="home">
          {/* 导航栏组件，显示账户相关信息 */}
          <NavBar accounts={accounts} setAccounts={setAccounts} />
          <div>
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner">{loadingMessage}</div>
              </div>
            )}
          </div>
          <ChakraBaseProvider>
            <div className="home_header">
              <Flex
                justify="center" // 水平居中
                align="center" // 垂直居中
              >
                <Box width="520px">
                  {/* 欢迎标题 */}
                  <Box className="home_welcometitle">koko World</Box>
                  {/* 按钮部分 */}
                  <div className="home_init">
                    {/* <button onClick={deployCatNFT_Onclick}>Deploy NFT</button>

                    <button onClick={getBalanceOnclick}>getBalance</button> */}
                  </div>
                </Box>
              </Flex>
            </div>
            <h3 className="properties_title">
              Properties For Donation
              <Button className="pink_button" onClick={refreshHomeOnclick}>
                Refresh
              </Button>
            </h3>{" "}
            <hr />
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
                        <strong>
                          Chip ID: {property.attributes[0]?.value}
                        </strong>
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
                refreshHome={refreshHome}
              />
            )}
          </ChakraBaseProvider>{" "}
        </div>
      )}
    </div>
  );
}

export default Home;
