import "../App.css";
import { ethers } from "ethers";
import {
  RPC_URL,
  HARDHAT_RPC_URL,
  PRIVATE_KEY0,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../setting/accountSetting";
import kokoCatNFT from "../artifacts/contracts/catNFT/kokoCatNFT.sol/kokoCatNFT.json";
import kokoToken from "../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
export var kokoTokenContract, catNFTContract, metadataArrary, tokenIdArrary;
metadataArrary = [];
tokenIdArrary = [];
/**
 * 部署合约函数
 */
async function deployNFT() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const account01 = new ethers.Wallet(PRIVATE_KEY0, provider);
  const account01Address = account01.address;
  console.log("account01 address", account01Address);
  console.log(`-----------01 deploy kokoToken--------------`);

  // 部署 kokoToken 合约, 并挖了100个koko币
  const kokoTokenFactory = new ethers.ContractFactory(
    kokoToken.abi,
    kokoToken.bytecode,
    account01
  );
  kokoTokenContract = await kokoTokenFactory.deploy(
    account01Address,
    account01Address
  );
  await kokoTokenContract.deployTransaction.wait();
  const kokoTokenAddress = kokoTokenContract.address;
  console.log(`kokoToken 合约 部署在 ${kokoTokenAddress}`);

  // const kokoTokenAddress = "0x424bbdA9cF5d1e238ade4b8CDFd7FF55A8f9F928";
  // const kokoTokenContract = new ethers.Contract(
  //   kokoTokenAddress,
  //   kokoToken.abi,
  //   provider
  // );
  // console.log(`kokoToken 合约 部署在 ${kokoTokenAddress}`);

  console.log(`-----------02 deploy-catNFT--------------`);
  // 部署 kokoCatNFT 合约, 并授权
  const testfactory = new ethers.ContractFactory(
    kokoCatNFT.abi,
    kokoCatNFT.bytecode,
    account01
  );
  catNFTContract = await testfactory.deploy(
    account01Address,
    account01Address,
    kokoTokenAddress
  );
  await catNFTContract.deployTransaction.wait();
  console.log("deploy catNFT contract end, address: ", catNFTContract.address);
  console.log(`------------mint-catNFT--------------`);
  for (let i = 1; i <= 8; i++) {
    // mint NFT 并设置 tokenURI
    const tokenUrljson = `https://maroon-elegant-mongoose-836.mypinata.cloud/ipfs/bafybeifxa7ke4dqimvvhdj5rchgtuse7ti3o5czhdevs26ux4pmczhdrbq/${i}.json`;
    const mintTx = await catNFTContract.safeMint(
      account01Address,
      tokenUrljson
    );
    await mintTx.wait();
    const tokenId = await catNFTContract.getTokenId();
    console.log("Mint successful, tokenId: ", tokenId.toString());
    const response = await fetch(tokenUrljson);
    const metadata = await response.json();
    // console.log(
    //   "metadata name: ",
    //   metadata.name,
    //   "metadata image url: ",
    //   metadata.image
    // );

    // 从 metadata 中提取租金和押金信息
    const chipId = metadata.attributes.find(
      (attr) => attr.trait_type === "Chip ID"
    ).value;
    const DonationPrice = metadata.attributes.find(
      (attr) => attr.trait_type === "Minimum Donation Fee"
    ).value;
    const DonationPriceInWei = ethers.utils.parseUnits(
      DonationPrice.toString(),
      18
    );

    const initCatPropertyTx = await catNFTContract.initCatProperty(
      tokenId,
      metadata.name,
      chipId,
      DonationPriceInWei
    );
    await initCatPropertyTx.wait();

    const catProperty = await catNFTContract.getCatProperty(tokenId);
    // console.log("catProperty: ", catProperty.donateMinValue.toString());

    metadataArrary.push(metadata);
    tokenIdArrary.push(tokenId);
  }
  // console.log("tokenIdArrary: ", tokenIdArrary);
  return [kokoTokenContract, catNFTContract];
}

export default deployNFT;
