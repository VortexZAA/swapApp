// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

abstract contract ERC721Referable is
    Initializable,
    ERC721URIStorageUpgradeable
{
    uint256 _currentTokenId;
    mapping(bytes32 => uint256) _refToTokenId;
    string _baseUri;

    function __ERC721Referable_init(
        string memory name_,
        string memory symbol_
    ) internal virtual onlyInitializing {
        __ERC721_init(name_, symbol_);
    }

    function refMint(
        address holder,
        bytes32 ref
    ) internal virtual returns (uint256) {
        uint256 tokenId = ++_currentTokenId;

        _refToTokenId[ref] = tokenId;
        _mint(holder, tokenId);

        return tokenId;
    }

    function refMint(
        address holder,
        bytes32 ref,
        string memory tokenUri
    ) internal virtual returns (uint256) {
        uint256 tokenId = ++_currentTokenId;

        _refToTokenId[ref] = tokenId;
        _mint(holder, tokenId);
        _setTokenURI(tokenId, tokenUri);

        return tokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(
        uint256 tokenId
    ) internal virtual override(ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}
