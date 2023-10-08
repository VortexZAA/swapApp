// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StorageTest1.sol";

contract StorageTest2 is StorageTest1 {
    uint a2;
    uint8 b2;
    uint32 c2;
    uint256[50] private __gap21;
    bool d2;
    uint256[50] private __gap22;

    s21 s2;
    uint8 h21;
    bool h22;

    struct s21 {
        bytes se;
        // uint sa;
        // uint8 sc;
        // address sd;
        bytes32 sf;
        bool sb;
    }
}
