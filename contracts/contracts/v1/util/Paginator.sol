// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library Paginator {
    function page(
        uint256 _length,
        uint256 _pageIndex,
        uint256 _size
    ) internal pure returns (uint256 _pageSize, uint256 _startIndex) {
        _pageSize = (_size > 100 ? 100 : _size);
        _startIndex = _pageIndex * _pageSize;
        if (_startIndex > _length) _pageSize = 0;
        else if (_startIndex + _pageSize > _length)
            _pageSize = _length - _startIndex;
    }
}
