// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AppToken is ERC20 {
    constructor() ERC20("APPToken", "APP") {
        _mint(msg.sender, 1_000_000_000_000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
//["Test", "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "teest", "0x5465737400000000000000000000000000000000000000000000000000000000", "0x7b96aF9Bd211cBf6BA5b0dd53aa61Dc5806b6AcE"]