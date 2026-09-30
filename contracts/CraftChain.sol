// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract CraftChain is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE =
        keccak256("MINTER_ROLE");

    uint256 private _nextTokenId = 1;

    mapping(uint256 => string) private _tokenMetadataURI;

    event StepRecorded(
        uint256 indexed tokenId,
        address indexed actor,
        string metadataURI,
        bytes32 dataHash,
        uint256 timestamp
    );

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

    function recordStep(
        uint256 tokenId,
        string calldata metadataURI,
        bytes32 dataHash
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        emit StepRecorded(
            tokenId,
            msg.sender,
            metadataURI,
            dataHash,
            block.timestamp
        );
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