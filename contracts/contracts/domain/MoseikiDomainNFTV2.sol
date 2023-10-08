// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Open Zeppelin libraries for controlling upgradability and access.
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "../v1/token/ERC721Referable.sol";
import "../v1/token/Token.sol";
import "../v1/util/StringHelper.sol";
import "../v1/util/ArrayFind.sol";
import "../v1/util/ArrayRemove.sol";
import "../v1/util/Error.sol";
import "../v1/access/Authorizer.sol";
import "../v1/money/SingleCashCollector.sol";

import "./MoseikiDomainNFT.sol";

contract MoseikiDomainNFTV2 is
    MoseikiDomainNFT
{
    function test123(uint a) public pure returns (uint) {
        return a + 1;
    }

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}
