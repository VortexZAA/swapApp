// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./V11.sol";

contract V12 is V11 {

    function dec() external {
        require(counter > 0, "no slices left");

        counter--;
    }

    ///@dev returns the contract version
    function version() external pure returns (uint256) {
        return 2;
    }


    function inc2() internal override {
        counter++;
    }
}
