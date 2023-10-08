// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../util/Error.sol";
import "../util/ArrayFind.sol";
import "../util/ArrayRemove.sol";

abstract contract Authorizer {
    uint256 constant BASE_AUTH = 2 ** 256 - 1;
    uint256 constant MANAGER_AUTH = BASE_AUTH - 1;

    using ArrayFind for address[];
    using ArrayRemove for address[];

    mapping(uint256 => address[]) authorities;

    function addAuthorized(
        uint256 _authority,
        address[] memory _addrs
    ) internal virtual {
        for (uint i = 0; i < _addrs.length; i++)
            _addAuthorized(_authority, _addrs[i]);
    }

    function addAuthorized(uint256 _authority, address _addr) internal virtual {
        _addAuthorized(_authority, _addr);
    }

    function _addAuthorized(uint256 _authority, address _addr) private {
        Error.checkAddress(_addr);

        if (authorities[_authority].exist(_addr)) return;

        authorities[_authority].push(_addr);
    }

    function removeAuthorized(
        uint256 _authority,
        address[] memory _addrs
    ) internal virtual {
        for (uint i = 0; i < _addrs.length; i++)
            authorities[_authority].remove(_addrs[i]);
    }

    function removeAuthorized(
        uint256 _authority,
        address _addr
    ) internal virtual {
        authorities[_authority].remove(_addr);
    }

    function isAuthorized(
        uint256 _authority,
        address _addr
    ) public view returns (bool) {
        return authorities[_authority].exist(_addr);
    }

    modifier onlyAuthorized(uint256 _authority, address _addr) {
        if (!authorities[_authority].exist(_addr)) revert Unauthorized();

        _;
    }

    // ERRORs
    error Unauthorized();

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}
