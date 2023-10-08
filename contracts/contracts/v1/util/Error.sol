// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./StringHelper.sol";

/*
error Failed(bytes reason);
error TransferFailed(bytes reason);
error ZeroAddress();
error AlreadyExist();
error ZeroValue();
error ZeroBalance();
error EmptyValue();
error InsufficientAmount();
error GreaterThanZero();
error Ownership();
error NotFound();
error InvalidTokenType();
error MustBeLaterThanNow();
error MustBeLaterThan(uint64 time);
error LengthMustBeAtLeast(uint length);
error NotStarted();
error Ended();
error Incomplete();
error NotRefundable();
error NoRefundFound();
error MustBeHigherThanPreviousOne();
error MustBeLowerThanPreviousOne();
error LengthMismatch();
error MaxSupplyReached();
error InvalidDate();
error InvalidData();
error InvalidAmount();
error Unauthorized();
*/

library Error {
    using StringHelper for string;

    function checkAddress(address addr) internal pure {
        if (addr == address(0)) revert ZeroAddress();
    }

    function checkZero(uint256 _value) internal pure {
        if (_value == 0) revert ZeroValue();
    }

    function checkEmpty(string memory _s) internal pure {
        if (_s.isEmpty()) revert EmptyValue();
    }

    // ERRORs
    error ZeroAddress();
    error ZeroValue();
    error EmptyValue();
}
