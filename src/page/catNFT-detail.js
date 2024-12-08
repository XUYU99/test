import { ethers } from "ethers";
import { useEffect, useState } from "react";

const NFTDetail = ({ property, togglePop, loadBlockchainData }) => {
  // 状态变量
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误状态

  // 获取房产、租赁托管 合约实例

  // 获取详细信息
  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("property: ", property);
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Error fetching property details");
    } finally {
      setLoading(false);
    }
  };

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
            Chip ID111: <strong>{property.attributes[0].value}</strong>
          </p>
          <hr />
          <h2>Overview</h2>
          <input
            className="nft_overview_input"
            type="number"
            placeholder={"0.005 ETH"}
          ></input>
          <button className="pink_button">donate</button>
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
