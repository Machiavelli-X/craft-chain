// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract CraftChain is ERC721, AccessControl {

    bytes32 public constant MINTER_ROLE =
        keccak256("MINTER_ROLE");

    uint256 private _nextTokenId = 1;

    mapping(uint256 => string) private _tokenMetadataURI;

    constructor(address admin)
        ERC721("Craft Chain", "CRAFT")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mint(
        address to,
        string calldata metadataURI
    )
        external
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;

        _nextTokenId++;

        _safeMint(to, tokenId);

        _tokenMetadataURI[tokenId] = metadataURI;

        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);

        return _tokenMetadataURI[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}