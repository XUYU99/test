import { useEffect, useState } from "react";
import { ethers } from "ethers";
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

  const donateMinValue = property.attributes[5].value;

  // 获取房产、租赁托管 合约实例

  // 获取详细信息
  const fetchDetails = async () => {
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
  };
  async function donateOnclick() {
    setdonateLoading(true); // 开始处理时显示弹窗
    await Donate(
      kokoTokenContract,
      catNFTContract,
      property.tokenId,
      donateMinValue,
      donateValue
    );
    await fetchDetails();
    setdonateLoading(false); // 完成后隐藏弹窗
    setdonateSuccess(true); // 成功弹窗
  }
  async function getBalanceOnclick() {
    let donateTotalBalance = await kokoTokenContract.balanceOf(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    console.log("donate Total 余额: ", donateTotalBalance.toString(), "KOKO");
  }
  // 点击确认关闭租房成功弹窗
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
          <div className="loading-spinner">正在处理中...</div>
        </div>
      )}
      {/* 租房成功的弹窗 */}
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
              </p>
              <br />
              please check the information, and click Confirm
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
        <div className="nftDetail__overview">
          <h1>{property.name}</h1>
          <p>
            Chip ID: <strong>{property.attributes[0].value}</strong>
          </p>
          <hr />
          <h2>Donation Overview</h2>
          <input
            className="nftDetail_overview_input"
            type="number"
            placeholder={"min " + donateMinValue + " KO"}
            onChange={(e) => setdonateValue(e.target.value)}
          ></input>
          <button className="pink_button" onClick={donateOnclick}>
            donate
          </button>
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
