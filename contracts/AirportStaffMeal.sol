pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AirportStaffMeal is ERC721, Ownable {

    using Strings for uint256;

    uint256 public constant StaffFoodPrice = 0.01 ether;
    uint256 public immutable totalSupply; //19
    uint256 public immutable MAX_PURCHASE; //1

    uint256 private firstPhaseSupply; // 10
    uint256 private secondPhaseSupply; // 9

    uint256 public startingIndexFirst;
    uint256 public startingIndexSecond;

    uint256 internal currentId;

    bool public firstSaleActive;
    bool public secondSaleActive;

    string private _base;

    constructor(
        uint256 _totalSupply, 
        uint256 _maxPurchase, 
        uint256 _firstPhaseSupply, 
        uint256 _secondPhaseSupply,
        string memory baseURI
    ) 
        ERC721("Taoyuan Airport Staff Meal", "TASF")
    {
        totalSupply = _totalSupply;
        MAX_PURCHASE = _maxPurchase;
        firstPhaseSupply = _firstPhaseSupply;
        secondPhaseSupply = _secondPhaseSupply;
        _base = baseURI;
    }

    function setStartingIndexFirst() external onlyOwner {
        require(startingIndexFirst == 0, "Airport Meal NFT: Phase1 already revealed");
        startingIndexFirst = uint256(blockhash(block.number - 1)) % firstPhaseSupply;
    }

    function setStartingIndexSecond() external onlyOwner {
        require(startingIndexSecond == 0, "Airport Meal NFT: Phase1 already revealed");
        startingIndexSecond = uint256(blockhash(block.number - 1)) % secondPhaseSupply;
    }

    function startPhase1Sale() external onlyOwner {
        firstSaleActive = true;
    }
    
    function startPhase2Sale() external onlyOwner {
        secondSaleActive = true;
    }

    function mintForFirstPhase() external payable {
        uint256 _curId = currentId;
        require(firstSaleActive == true, "Airport Meal NFT: Event hasn't started yet.");
        require(_curId < firstPhaseSupply, "Airport Meal NFT: Sale ended.");
        require(msg.value >= StaffFoodPrice, "Airport Meal NFT: Ether value invalid.");
        _safeMint(msg.sender, _curId);
        currentId += 1;
        if (currentId == firstPhaseSupply){
            firstSaleActive = false;
        }
    }

    function mintForSecondPhase() external payable {
        uint256 _curId = currentId;
        require(secondSaleActive == true, "Airport Meal NFT: Event hasn't started yet.");
        require(_curId < firstPhaseSupply + secondPhaseSupply, "Airport Meal NFT: Sale ended.");
        require(msg.value >= StaffFoodPrice, "Airport Meal NFT: Ether value invalid.");
        _safeMint(msg.sender, _curId);
        currentId += 1;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
       _base = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _base;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for non existent token");        
        string memory base = _baseURI();
        string memory unRevealURI = "1234";
        if (startingIndexFirst != 0 && tokenId < firstPhaseSupply) {
            uint256 _id = tokenId + startingIndexFirst;
            if (_id > totalSupply) {
                _id -= totalSupply;
            }
            return string(abi.encodePacked(base, _id.toString()));
        }
        if (startingIndexSecond != 0) {
            uint256 _id = tokenId + firstPhaseSupply + startingIndexSecond;
            if (_id > totalSupply) {
                _id %= totalSupply;
            }
            return string(abi.encodePacked(base, _id.toString()));
        }
        return unRevealURI;
    }
}