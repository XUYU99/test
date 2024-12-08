import "../../App.css";
import { ethers } from "ethers";
import {
  HARDHAT_RPC_URL,
  PRIVATE_KEY0,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} from "../../setting/accountSetting";
import kokoCatNFT from "../../artifacts/contracts/catNFT/kokoCatNFT.sol/kokoCatNFT.json";
import kokoToken from "../../artifacts/contracts/kokoDao/kokoToken.sol/kokoToken.json";
export var kokoTokenContract, catNFTContract, metadataArrary, tokenIdArrary;
metadataArrary = [];
tokenIdArrary = [];
/**
 * 部署合约函数
 */
async function deployNFT() {
  const provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY0, provider);
  const signerAddress = signer.address;
  console.log("signer", signerAddress);
  console.log(`-----------01 deploy kokoToken--------------`);
  const kokoTokenfactory = new ethers.ContractFactory(
    kokoToken.abi,
    kokoToken.bytecode,
    signer
  );
  // 部署 kokoToken 合约, 并挖了100个koko币
  kokoTokenContract = await kokoTokenfactory.deploy("koko", "KO");
  await kokoTokenContract.deployTransaction.wait();
  const kokoTokenAddress = kokoTokenContract.address;
  console.log("deploy kokoToken end, address: ", kokoTokenAddress);
  console.log(`-----------02 deploy-catNFT--------------`);
  // 部署 kokoCatNFT 合约, 并授权
  const testfactory = new ethers.ContractFactory(
    kokoCatNFT.abi,
    kokoCatNFT.bytecode,
    signer
  );
  catNFTContract = await testfactory.deploy(
    signerAddress,
    signerAddress,
    kokoTokenAddress
  );
  await catNFTContract.deployTransaction.wait();
  console.log("deploy catNFT contract end, address: ", catNFTContract.address);
  console.log(`------------mint-catNFT--------------`);
  for (let i = 1; i <= 8; i++) {
    // mint NFT 并设置 tokenURI
    const tokenUrljson = `https://maroon-elegant-mongoose-836.mypinata.cloud/ipfs/bafybeifxa7ke4dqimvvhdj5rchgtuse7ti3o5czhdevs26ux4pmczhdrbq/${i}.json`;
    const mintTx = await catNFTContract.safeMint(signerAddress, tokenUrljson);
    await mintTx.wait();
    const tokenId = await catNFTContract.getTokenId();
    console.log("Mint successful, tokenId: ", tokenId.toString());
    const response = await fetch(tokenUrljson);
    const metadata = await response.json();
    console.log(
      "metadata name: ",
      metadata.name,
      "metadata image url: ",
      metadata.image
    );

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
    console.log("catProperty: ", catProperty.donateMinValue.toString());

    metadataArrary.push(metadata);
    tokenIdArrary.push(tokenId);
  }
  // console.log("metadataArrary: ", metadataArrary);
  console.log("tokenIdArrary: ", tokenIdArrary);
  return catNFTContract;
  // 设置 猫猫信息
  // uint256 tokenId,string memory _name,uint256 _chipId,uint256 _birthDate,uint256 _age,bool _sex,string memory _breed
  // const _name = "neow";
  // const _chipId = "2763";
  // const _birthDate = 20190109;
  // const _age = 6;
  // const _sex = 1;
  // const _breed = "British shorthair";
  // const addCatTx = await catNFTContract.addCat(
  //   tokenId,
  //   _name,
  //   _chipId,
  //   _birthDate,
  //   _age,
  //   _sex,
  //   _breed
  // );
  // const response = await addCatTx.wait();
  // console.log("addCat successful, response: ", response);

  // const getCatTx = await catNFTContract.getCat(tokenId);
  // console.log("addCat successful, response: ", getCatTx.toString());
  // return getCatTx;
}

export default deployNFT;
