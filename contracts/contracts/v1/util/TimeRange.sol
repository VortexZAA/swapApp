// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Error.sol";

abstract contract TimeRange {
    StartEndTime[] times;

    function addTimeRange(StartEndTime memory _range) internal {
        if (_range.start < block.timestamp) revert MustBeLaterThanNow();
        if (_range.start > _range.end) revert MustBeLaterThan(_range.start);

        uint256 _len = times.length;
        if (_len > 0 && _range.start <= times[_len - 1].start)
            revert MustBeLaterThan(times[_len - 1].start);

        times.push(_range);
    }

    function removeTimeRanges() internal {
        while (times.length > 0) times.pop();
    }

    function isTimeRangeStarted(uint256 _i) internal view returns (bool) {
        if (_i >= times.length) return false;

        return times[_i].start <= block.timestamp;
    }

    function isTimeRangeEnded(uint256 _i) internal view returns (bool) {
        if (_i >= times.length) return false;

        return times[_i].end <= block.timestamp;
    }

    function isItInTimeRange(uint256 _i) internal view returns (bool) {
        return isTimeRangeStarted(_i) && !isTimeRangeEnded(_i);
    }

    function checkTimeRangeStarted(uint256 _i) internal view {
        if (!isTimeRangeStarted(_i)) revert NotStarted();
    }

    function checkTimeRangeEnded(uint256 _i) internal view {
        if (isTimeRangeEnded(_i)) revert Ended();
    }

    function checkTimeRange(uint256 _i) internal view {
        checkTimeRangeStarted(_i);
        checkTimeRangeEnded(_i);
    }

    error MustBeLaterThanNow();
    error MustBeLaterThan(uint64 time);
    error LengthMustBeAtLeast(uint length);
    error NotStarted();
    error Ended();

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}

struct StartEndTime {
    uint64 start;
    uint64 end;
}
