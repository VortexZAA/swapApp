// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../util/ArrayFind.sol";
import "../util/ArrayRemove.sol";
import "../util/Error.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract PaymentToken is Initializable {
    using ArrayFind for address[];
    using ArrayRemove for address[];

    address[] _paymentTokens;

    function __PaymentToken_init(
        address[] memory paymentTokens
    ) internal virtual onlyInitializing {
        addPaymentTokens(paymentTokens);
    }

    function addPaymentTokens(address[] memory paymentTokens) internal {
        for (uint i = 0; i < paymentTokens.length; i++) {
            address paymentToken = paymentTokens[i];
            if (address(paymentToken) == address(0)) revert ZeroAddress();

            if (!ArrayFind.exist(_paymentTokens, paymentToken))
                _paymentTokens.push(paymentToken);
        }
    }

    function getPaymentTokens() public view returns (address[] memory) {
        return _paymentTokens;
    }

    function isPaymentToken(address paymentToken) public view returns (bool) {
        return _isPaymentToken(paymentToken, false);
    }

    function _isPaymentToken(
        address paymentToken,
        bool reverting
    ) internal view returns (bool) {
        bool exist = _paymentTokens.exist(paymentToken);
        if (!exist && reverting) revert NotFound();

        return exist;
    }

    error ZeroAddress();
    error NotFound();

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}
