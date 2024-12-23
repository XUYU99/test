// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {AccessControl} from "../openzeppelin/access/AccessControl.sol";
import {ERC721} from "../openzeppelin/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "../openzeppelin/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721URIStorage} from "../openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC20} from "../openzeppelin/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract kokoCatNFT is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;
    uint256 public totalMintSupply;
    address public kokoTokenAddress; // 引入 kokoToken 合约地址
    IERC20 public kokoToken;
    address public defaultAdmin;
    address public minter;

    // 猫猫的综合信息结构体
    struct Property {
        string name; // 猫猫名字
        uint256 chipId; // 芯片ID
        uint256 donateMinValue; // 捐赠最小金额
    }

    // 存储猫猫信息
    mapping(uint256 => Property) public cats; // tokenId - Property
    mapping(uint256 => uint256) public catsAmount; //tokenId 对应 donateAmount，一个cat收到了多少捐赠

    constructor(
        address _defaultAdmin,
        address _minter,
        address _kokoTokenAddress // kokoToken合约地址
    ) ERC721("Cat Property", "kokoCAT") {
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(MINTER_ROLE, _minter);
        kokoTokenAddress = _kokoTokenAddress;
        kokoToken = IERC20(kokoTokenAddress); // 初始化kokoToken
        totalMintSupply = 0;
        defaultAdmin = _defaultAdmin;
        minter = _minter;
    }

    uint256 public newtokenId;

    function getTokenId() public view returns (uint256) {
        return newtokenId;
    }

    function getTotalMintSupply() public view returns (uint256) {
        return totalMintSupply;
    }

    function safeMint(
        address to,
        string memory uri
    ) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        newtokenId = tokenId;
        totalMintSupply = totalMintSupply + 1;
    }

    // 通过 tokenId 获取 tokenURI
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // 捐赠
    function donate(uint256 tokenId, uint256 donateValueInWei) public payable {
        address _kokoCatNFTAddress = address(this);
        console.log(
            "kokoCatNFT-donate()-kokoTokenAddress:",
            address(kokoToken)
        );
        console.log("kokoCatNFT-donate()-msg.sender address:", _msgSender());

        // msgSender 的余额
        uint256 _msgsenderBalance = kokoToken.balanceOf(_kokoCatNFTAddress);
        console.log(
            "kokoCatNFT-donate()-_msgsenderBalance:",
            _msgsenderBalance
        );
        // catNFT 合约的余额
        uint256 _kokoCatNFTAddressBalance = kokoToken.balanceOf(
            _kokoCatNFTAddress
        );
        console.log(
            "kokoCatNFT-donate()-_kokoCatNFTAddressBalance:",
            _kokoCatNFTAddressBalance
        );

        // 将基金转入 pool中
        // address donateFundingPool = defaultAdmin;
        // 将捐赠的钱转入 catNFT 合约中
        bool success = kokoToken.transferFrom(
            _msgSender(),
            _kokoCatNFTAddress,
            donateValueInWei
        );
        require(success, "Token transfer failed");

        // msgSender 的余额
        _msgsenderBalance = kokoToken.balanceOf(_msgSender());
        console.log(
            "kokoCatNFT-donate()-_msgsenderBalance:",
            _msgsenderBalance
        );
        // catNFT 合约的余额
        _kokoCatNFTAddressBalance = kokoToken.balanceOf(_kokoCatNFTAddress);
        console.log(
            "kokoCatNFT-donate()-_kokoCatNFTAddressBalance:",
            _kokoCatNFTAddressBalance
        );

        // 更新猫猫的捐赠金额
        catsAmount[tokenId] += donateValueInWei;
    }

    // 销毁 NFT
    function burn(uint256 tokenId) public override {
        super.burn(tokenId);

        // 检查 NFT 是否存在，确保 totalMintSupply 正常减少
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        totalMintSupply--;
    }

    // 初始化猫猫信息
    function initCatProperty(
        uint256 tokenId,
        string memory _name,
        uint256 _chipId,
        uint256 _donateMinValue
    ) public {
        // 防止重复初始化
        require(
            bytes(cats[tokenId].name).length == 0,
            "Cat property already initialized"
        );

        cats[tokenId] = Property({
            name: _name,
            chipId: _chipId,
            donateMinValue: _donateMinValue
        });
    }

    // 设置猫猫信息
    function setCatProperty(
        uint256 tokenId,
        string memory _name,
        uint256 _chipId,
        uint256 _donateMinValue
    ) public {
        // 确保猫猫存在并且数据不为空
        require(_ownerOf(tokenId) != address(0), "Cat does not exist");

        cats[tokenId] = Property({
            name: _name,
            chipId: _chipId,
            donateMinValue: _donateMinValue
        });
    }

    // 获取猫猫信息
    function getCatProperty(
        uint256 tokenId
    ) public view returns (Property memory) {
        Property memory cat = cats[tokenId];
        return cat;
    }

    // 提取合约中的 ETH
    function withdraw(
        uint256 amount,
        address payable to
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            address(this).balance >= amount,
            "Insufficient balance in the contract"
        );
        to.transfer(amount);
    }

    //  检查合约是否支持某个特定的接口
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
