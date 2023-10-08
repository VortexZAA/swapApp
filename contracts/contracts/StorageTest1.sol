// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StorageTest1 {
    uint a;
    uint8 b;
    uint32 c;
    uint256[50] private __gap1;
    bool d;
    uint256[50] private __gap2;
    string str1 =
        "this is a text message for storage test. string is a reference type. so this variable slot only store the address of this string value and takes up one slot";
    bytes str2;
    bytes32 str3;

    error e1();

    function f1() public {}

    function f2() internal {}

    function f3() external {}

    function f4() private {}

    uint g;
    error e2();
    s1 s;
    uint8 h1;
    bool h2;

    struct s1 {
        bytes se;
        // uint sa;
        // uint8 sc;
        // address sd;
        bytes32 sf;
        bool sb;
    }
}
