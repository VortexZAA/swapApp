// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../money/CashCollector.sol";

abstract contract SingleCashCollector is Initializable, CashCollector {
    function __SingleCashCollector_init(
        address payee,
        address[] memory paymentTokens
    ) public virtual onlyInitializing {
        address[] memory addrs = new address[](1);
        addrs[0] = payee;
        uint256[] memory shareRates = new uint256[](1);
        shareRates[0] = 100;

        __CashCollector_init(
            addrs,
            100,
            shareRates,
            paymentTokens
        );
    }

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}
