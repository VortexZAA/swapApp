// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ArrayFind.sol";

library ArrayRemove {
    using ArrayFind for uint256[];
    using ArrayFind for string[];
    using ArrayFind for address[];
    using ArrayFind for bytes32[];

    function remove(uint256[] storage arr, uint256 value) internal {
        removeByIndex(arr, arr.find(value));
    }

    function remove(string[] storage arr, string memory value) internal {
        removeByIndex(arr, arr.find(value));
    }

    function remove(bytes32[] storage arr, bytes32 value) internal {
        removeByIndex(arr, arr.find(value));
    }

    function remove(address[] storage arr, address value) internal {
        removeByIndex(arr, arr.find(value));
    }

    function removeByIndex(uint256[] storage arr, uint256 ind) internal {
        if (arr.length == 0) return;
        if (ind > arr.length - 1) return;
        if (ind < arr.length - 1) arr[ind] = arr[arr.length - 1];

        arr.pop();
    }

    function removeByIndex(string[] storage arr, uint256 ind) internal {
        if (arr.length == 0) return;
        if (ind > arr.length - 1) return;
        if (ind < arr.length - 1) arr[ind] = arr[arr.length - 1];

        arr.pop();
    }

    function removeByIndex(bytes32[] storage arr, uint256 ind) internal {
        if (arr.length == 0) return;
        if (ind > arr.length - 1) return;
        if (ind < arr.length - 1) arr[ind] = arr[arr.length - 1];

        arr.pop();
    }

    function removeByIndex(address[] storage arr, uint256 ind) internal {
        if (arr.length == 0) return;
        if (ind > arr.length - 1) return;
        if (ind < arr.length - 1) arr[ind] = arr[arr.length - 1];

        arr.pop();
    }
}
