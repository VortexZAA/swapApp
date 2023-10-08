// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Error.sol";
import "hardhat/console.sol";

struct StartEndTime {
    uint64 start;
    uint64 end;
}

library TimeRangeLib {
    function addTimeRange(
        StartEndTime[] storage _times,
        StartEndTime memory _range
    ) internal {
        if (_range.start < block.timestamp) revert MustBeLaterThanNow();
        if (_range.start > _range.end)
            revert MustBeLaterThan(_range.start);

        uint256 _len = _times.length;
        if (_len > 0 && _range.start <= _times[_len - 1].start)
            revert MustBeLaterThan(_times[_len - 1].start);

        _times.push(_range);
    }

    function removeTimeRanges(StartEndTime[] storage _times) internal {
        while (_times.length > 0) _times.pop();
    }

    function isRangeStarted(
        StartEndTime[] memory _times,
        uint256 _i
    ) internal view returns (bool) {
        if (_i >= _times.length) return false;

        return _times[_i].start <= block.timestamp;
    }

    function isRangeEnded(
        StartEndTime[] memory _times,
        uint256 _i
    ) internal view returns (bool) {
        if (_i >= _times.length) return false;

        console.log("isRangeStarted");
        console.logUint(block.timestamp);
        console.logUint(_times[_i].end);

        return _times[_i].end <= block.timestamp;
    }

    function isItInRange(
        StartEndTime[] memory _times,
        uint256 _i
    ) internal view returns (bool) {
        return isRangeStarted(_times, _i) && !isRangeEnded(_times, _i);
    }

    function checkRangeStarted(
        StartEndTime[] memory _times,
        uint256 _i
    ) internal view {
        if (!isRangeStarted(_times, _i)) revert NotStarted();
    }

    function checkRangeEnded(
        StartEndTime[] memory _times,
        uint256 _i
    ) internal view {
        if (isRangeEnded(_times, _i)) revert Ended();
    }

    function checkRange(
        StartEndTime[] memory _times,
        uint256 _i
    ) internal view {
        checkRangeStarted(_times, _i);
        checkRangeEnded(_times, _i);
    }

    error MustBeLaterThanNow();
    error MustBeLaterThan(uint64 time);
    error LengthMustBeAtLeast(uint length);
    error NotStarted();
    error Ended();
}
