import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  RPC_URL,
  HARDHAT_RPC_URL,
  PRIVATE_KEY0,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../../setting/accountSetting";
import Donate from "./Donate";

const NFTDetail = ({
  provider,
  kokoTokenContract,
  catNFTContract,
  property,
  togglePop,
  loadBlockchainData,
}) => {
  // 状态变量
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误状态
  const [donateValue, setdonateValue] = useState(null);
  const [donateTotal, setdonateTotal] = useState(null);
  const [donateLoading, setdonateLoading] = useState(false);
  const [donateSuccess, setdonateSuccess] = useState(false);
  // const [alert, setalert] = useState(null);
  const donateMinValue = property.attributes[5].value;

  // 获取详细信息
  async function fetchDetails() {
    try {
      console.log("fetchDetails");
      setLoading(true);
      setError(null);

      const donateTotalAmountInWei = await catNFTContract.catsAmount(
        property.tokenId
      );
      const donateTotalAmount = ethers.utils.formatUnits(
        donateTotalAmountInWei,
        18
      );
      setdonateTotal(donateTotalAmount);
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Error fetching property details");
    } finally {
      setLoading(false);
    }
  }

  async function checkMetaMask() {
    // 检查是否安装了 MetaMask
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask 插件未安装，请先安装 MetaMask！");
      return false;
    }
    try {
      // 请求账户连接
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length === 0) {
        // 未连接账户
        alert("尚未连接账户，请先连接账户！");
        return false;
      } else {
        // 已连接账户
        console.log("MetaMask 已连接账户：", accounts[0]);
        return accounts[0];
      }
    } catch (error) {
      console.error("检查 MetaMask 状态时出错：", error);
      alert("无法获取账户，请检查 MetaMask 设置！");
      return false;
    }
  }
  async function donateOnclick() {
    // 检查 MetaMask 是否已连接
    const signerAddress = await checkMetaMask();
    if (!signerAddress) return;

    try {
      setdonateLoading(true); // 开始处理时显示弹窗

      // 检查是否拥有 koko 币
      const hasKOKOToken = await kokoTokenContract.balanceOf(signerAddress);
      if (hasKOKOToken == 0) {
        alert("抱歉，您暂未拥有koko币，请联系koko");
        return;
      }

      const success = await Donate(
        kokoTokenContract.address,
        catNFTContract.address,
        property.tokenId,
        donateMinValue,
        donateValue
      );

      if (success) {
        await fetchDetails();
        setdonateSuccess(true); // 成功弹窗
      } else return;
    } catch (error) {
      console.error("捐赠操作失败：", error);
      alert("捐赠操作失败，请检查控制台日志！");
    } finally {
      setdonateLoading(false); // 确保加载状态复位
    }
  }

  // async function donate(
  //   kokoTokenContract,
  //   catNFTContract,
  //   tokenId,
  //   donateMinValue,
  //   donateValue
  // ) {
  //   try {
  //     console.log(`------------donate-catNFT--------------`);
  //     // 初始化 RPC 提供器
  //     const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  //     const account01 = new ethers.Wallet(PRIVATE_KEY0, provider);
  //     const account01Address = await account01.getAddress();
  //     console.log("account01 address:", account01Address);
  //     // 获取当前网络信息
  //     const network = await provider.getNetwork();
  //     console.log("Network : ", network);

  //     // // 获取 account01 的 kokoToken 余额
  //     console.log("kokoTokenContract address:", kokoTokenContract.address);
  //     let account01KokoBalance = await kokoTokenContract.balanceOf(
  //       account01Address
  //     );
  //     console.log(
  //       "account01 koko Balance:",
  //       ethers.utils.formatUnits(account01KokoBalance.toString(), 18) // 格式化为以太单位
  //     );

  //     // 将 donateValue 转换为 BigNumber 类型（单位为 wei）
  //     const donateValueInWei = ethers.utils.parseUnits(
  //       donateValue.toString(),
  //       18
  //     ); // 转换为 wei 单位
  //     // console.log("donateValueInWei:", donateValueInWei.toString());

  //     let catNFTContractBalance = await kokoTokenContract.balanceOf(
  //       catNFTContract.address
  //     );
  //     console.log("catNFTContractBalance:", catNFTContractBalance);
  //     // 开始进行捐赠操作
  //     const transaction = await kokoTokenContract
  //       .connect(account01)
  //       .transfer(catNFTContract.address, donateValueInWei, {
  //         gasLimit: 500000,
  //       });
  //     const denate = await catNFTContract.donate(tokenId, donateValueInWei, {
  //       gasLimit: 500000,
  //     });

  //     // 等待捐赠交易完成
  //     const receipt = await denate.wait();

  //     console.log("捐赠后--------------------");

  //     catNFTContractBalance = await kokoTokenContract.balanceOf(
  //       catNFTContract.address
  //     );
  //     console.log("catNFTContractBalance:", catNFTContractBalance);
  //     return true;
  //   } catch (error) {
  //     console.error("捐赠 失败：", error);
  //     alert("捐赠失败，请检查控制台日志！");
  //   }
  // }

  // 点击确认关闭捐赠成功弹窗
  const successMessageOnclick = () => {
    setdonateSuccess(false); // 关闭弹窗
  };

  // 加载数据
  useEffect(() => {
    fetchDetails();
  }, []);

  return (
    <div className="nftDetail">
      {donateLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            Processing, please wait a moment...
          </div>
        </div>
      )}
      {/* 捐赠成功的弹窗 */}
      {donateSuccess && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="loading-successmessage">
              <h2>Donation was successful</h2>
              <br />
              <p>
                The donation amount is
                <strong> {donateValue} KO </strong>
                ,pat Chip Id is{" "}
                <strong> {property.attributes[0].value} </strong>
                <br />
              </p>
              <p>
                the collection address is :0x...
                <br />
                <br />
                please check the information, and click Confirm{" "}
              </p>
            </div>
            <div className="loading-successmessage-button">
              <button
                type="button"
                className="successmessage-button"
                onClick={successMessageOnclick}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="nftDetail__details">
        <div className="nftDetail__image">
          <img src={property.image} alt="nftDetail" />
        </div>
        <div className="nftDetail__info">
          <h1>{property.name}</h1>
          <p>
            Chip ID: <strong>{property.attributes[0].value}</strong>
          </p>
          <hr />
          <h2>Donation Overview</h2>
          <input
            className="nftDetail_info_input"
            type="number"
            placeholder={"min " + donateMinValue + " KO"}
            onChange={(e) => setdonateValue(e.target.value)}
          ></input>
          <button className="donate_button" onClick={donateOnclick}>
            donate
          </button>
          {/* <button className="pink_button" onClick={getBalanceOnclick}>
            get
          </button> */}
          <h4>
            {" "}
            Donations received: <strong>{donateTotal} </strong>
          </h4>

          <hr />
          <h2>Features</h2>
          <ul>
            {property.attributes.map((attribute, index) => (
              <li key={index}>
                {attribute.trait_type} : {attribute.value}
              </li>
            ))}

            <li>1111</li>
            <li>1111</li>
            <li>1111</li>
          </ul>
        </div>
        <button onClick={togglePop} className="nftDetail__close">
          x
        </button>
      </div>
    </div>
  );
};

export default NFTDetail;
