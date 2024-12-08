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
  console.log("property", property);
  const donateMinValue = property.attributes[5].value;
  console.log("property value", property.attributes[5].value);

  // 获取房产、租赁托管 合约实例

  // 获取详细信息
  async function fetchDetails() {
    try {
      setLoading(true);
      setError(null);
      setdonateValue(donateMinValue);
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Error fetching property details");
    } finally {
      setLoading(false);
    }
  }
  function donateOnclick() {
    // console.log("donateValue: ", donateValue);
    // console.log("donateMinValue: ", donateMinValue);
    Donate(
      kokoTokenContract,
      catNFTContract,
      property.tokenId,
      donateMinValue,
      donateValue
    );
  }
  async function getBalanceOnclick() {
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:8545"
    );
    let donateTotalBalance = await provider.getBalance(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    let donateTotalBalanceBalanceInEth =
      ethers.utils.formatEther(donateTotalBalance);
    console.log("donate Total 余额: ", donateTotalBalanceBalanceInEth, "ETH");
  }

  // 加载数据
  useEffect(() => {
    fetchDetails();
  }, []);

  return (
    <div className="nft">
      <div className="nft__details">
        <div className="nft__image">
          <img src={property.image} alt="nft" />
        </div>

        <div className="nft__overview">
          <h1>{property.name}</h1>
          <p>
            Chip ID: <strong>{property.attributes[0].value}</strong>
          </p>
          <hr />
          <h2>Overview</h2>
          <input
            className="nft_overview_input"
            type="number"
            placeholder={"min " + donateMinValue + " ETH"}
            onChange={(e) => setdonateValue(e.target.value)}
          ></input>
          <button className="pink_button" onClick={donateOnclick}>
            donate
          </button>
          <button onClick={getBalanceOnclick}>getBalance</button>
          <hr />
          <h2>Facts and features</h2>
          <ul>
            {property.attributes.map((attribute, index) => (
              <li key={index}>
                {attribute.trait_type} : {attribute.value}
              </li>
            ))}

            <li>1111</li>
            <li>1111</li>
            <li>1111</li>
            <li>1111</li>
            <li>1111</li>
          </ul>
        </div>
        <button onClick={togglePop} className="nft__close">
          x
        </button>
      </div>
    </div>
  );
};

export default NFTDetail;
