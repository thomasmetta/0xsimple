pragma solidity >=0.7.0 <0.9.0;


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155, Ownable {

    mapping(uint256 => uint) public _availableSupply;
    mapping (uint256 => string) private _uris;

    constructor() public ERC1155("") {

    }

    function contractURI() public view returns (string memory) {
        return "https://ipfs.io/ipfs/bafkreidii4qgghama3uepncfbv6qmg4xoyuxeywftjklqqfhzunttoz3sa";
    }

    function claim(uint256 tokenId) external payable  {
           require(_availableSupply[tokenId] > 0, "No more supply");
           _availableSupply[tokenId] = _availableSupply[tokenId] - 1;
           _mint(msg.sender, tokenId, 1, "");
    }

    function uri(uint256 tokenId) override public view returns (string memory) {
        return(_uris[tokenId]);
    }

    function createToken(uint256 tokenId, string memory uri, uint supply) public onlyOwner {
        setTokenUri(tokenId, uri);
        setSupply(tokenId, supply);
    }

    function setTokenUri(uint256 tokenId, string memory uri) private onlyOwner {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice"); 
        _uris[tokenId] = uri; 
    }

    function setSupply(uint256 tokenId, uint supply) private onlyOwner {
        require(_availableSupply[tokenId] == 0, "Cannot set supply twice"); 
        _availableSupply[tokenId] = supply; 
    }
}