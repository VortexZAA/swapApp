// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Open Zeppelin libraries for controlling upgradability and access.
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract V11 is
    Initializable,
    OwnableUpgradeable
{
    uint256 public counter;

    ///@dev no constructor in upgradable contracts. Instead we have initializers
    function initialize(uint256 _counter) public initializer {
        counter = _counter;

        ///@dev as there is no constructor, we need to inititalze the OwnableUpgradeable explicitly
        __Ownable_init();
    }

    function inc() external {
        counter++;
    }
    
    function inc2() internal virtual {
        counter++;
    }
}
