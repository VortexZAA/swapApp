// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ArrayFind {
    uint256 constant IndexNotFound = 2 ^ (256 - 1);

    function find(
        uint256[] memory arr,
        uint256 value
    ) internal pure returns (uint256) {
        uint256 ind = IndexNotFound;
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                ind = i;
                break;
            }
        }

        return ind;
    }

    function find(
        string[] memory arr,
        string memory value
    ) internal pure returns (uint256) {
        bytes32 valueBytes = keccak256(abi.encodePacked(value));
        uint256 ind = IndexNotFound;
        for (uint256 i = 0; i < arr.length; i++) {
            if (keccak256(abi.encodePacked(arr[i])) == valueBytes) {
                ind = i;
                break;
            }
        }

        return ind;
    }

    function find(
        bytes32[] memory arr,
        bytes32 value
    ) internal pure returns (uint256) {
        uint256 ind = IndexNotFound;
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                ind = i;
                break;
            }
        }

        return ind;
    }

    function find(
        address[] memory arr,
        address value
    ) internal pure returns (uint256) {
        uint256 ind = IndexNotFound;
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                ind = i;
                break;
            }
        }

        return ind;
    }

    function exist(
        uint256[] memory arr,
        uint256 value
    ) internal pure returns (bool) {
        return find(arr, value) != IndexNotFound;
    }

    function exist(
        string[] memory arr,
        string memory value
    ) internal pure returns (bool) {
        return find(arr, value) != IndexNotFound;
    }

    function exist(
        bytes32[] memory arr,
        bytes32 value
    ) internal pure returns (bool) {
        return find(arr, value) != IndexNotFound;
    }

    function exist(
        address[] memory arr,
        address value
    ) internal pure returns (bool) {
        return find(arr, value) != IndexNotFound;
    }

    function checkForDublicates(
        address[] memory arr
    ) internal pure returns (bool) {
        for (uint i = 0; i < arr.length; i++) {
            address _val = arr[i];

            for (uint j = i + 1; j < arr.length; j++) {
                if (arr[j] == _val) return true;
            }
        }

        return false;
    }
}
