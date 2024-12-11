const { ethers } = require("ether");
const { deploy, log } = deployments;
const {
  RPC_URL,
  PRIVATE_KEY0,
  HARDHAT_RPC_URL,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY0,
} = require("../src/setting/accountSetting.js");

async function main() {
  console.log(`start deploy ERC20 NFT contract `);

  //获取链信息
  const network = await provider.getNetwork();
  console.log("Network : ", network);

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const getBalanceAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  const balance = await provider.getBalance(getBalanceAddress);
  console.log(
    getBalanceAddress,
    " balance :",
    ethers.utils.formatUnits(balance.toString(), 18)
  );
}
// 执行主函数
// module.exports = main;
main()
  .then(() => process.exit(0)) // 成功时退出进程
  .catch((error) => {
    console.error(error); // 输出错误信息
    process.exit(1); // 退出进程
  });
