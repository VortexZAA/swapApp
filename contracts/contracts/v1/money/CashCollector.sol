// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../util/Error.sol";
import "../token/PaymentToken.sol";
import "../token/Token.sol";
import "../util/ArrayFind.sol";

// import "../../external/hardhat/console.sol";

abstract contract CashCollector is Initializable, PaymentToken {
    using ArrayFind for address[];

    address[] private _payees;
    uint256 _totalRate;
    uint256[] _shareRates;

    // mapping(address => uint256) private _totalReleased;
    // mapping(address => uint256) private _totalShared;
    mapping(address => mapping(address => uint256)) private _balances;

    bool internal _locked;

    function __CashCollector_init(
        address[] memory payees,
        uint256 totalRate,
        uint256[] memory shareRates,
        address[] memory paymentTokens
    ) internal virtual onlyInitializing {
        __PaymentToken_init(paymentTokens);

        setShares(payees, totalRate, shareRates);
    }

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    function setShares(
        address[] memory payees,
        uint256 totalRate,
        uint256[] memory shareRates
    ) internal {
        if (payees.length == 0 || payees.length != shareRates.length)
            revert InvalidData();
        uint256 totalOfRates;
        for (uint i = 0; i < shareRates.length; i++) {
            if (payees[i] == address(0) || shareRates[i] == 0)
                revert InvalidData();

            totalOfRates += shareRates[i];
        }

        if (totalRate != totalOfRates) revert InvalidData();

        // clear old balances (if the payee balance is greater than zero, can a better solution be found?)
        for (uint i = 0; i < _paymentTokens.length; i++) {
            for (uint j = 0; j < _payees.length; j++)
                delete _balances[_paymentTokens[i]][_payees[j]];
        }

        _payees = payees;
        _totalRate = totalRate;
        _shareRates = shareRates;
    }

    function calcAllShares() public {
        return calcAllSharesWithTokens(new address[](0));
    }

    function calcAllSharesWithTokens(address[] memory tokenAddrs) public {
        // native token
        calcTokenShares(address(0));

        tokenAddrs = tokenAddrs.length > 0 ? tokenAddrs : _paymentTokens;

        for (uint i = 0; i < tokenAddrs.length; i++)
            calcTokenShares(tokenAddrs[i]);
    }

    function calcTokenShares(address paymentToken) public {
        uint256 balance = paymentToken == address(0)
            ? address(this).balance
            : IERC20(paymentToken).balanceOf(address(this));
        uint256 totalPayeesBalance;
        for (uint i = 0; i < _payees.length; i++)
            totalPayeesBalance += _balances[paymentToken][_payees[i]];

        uint256 shareableBalance;
        if (balance > totalPayeesBalance)
            shareableBalance = balance - totalPayeesBalance;

        if (_payees.length > 1) {
            for (uint i = 0; i < _payees.length; i++) {
                uint256 share = (shareableBalance * _shareRates[i]) /
                    _totalRate;
                _balances[paymentToken][_payees[i]] += share;
            }
        } else {
            _balances[paymentToken][_payees[0]] += shareableBalance;
        }
    }

    function getBalances()
        public
        view
        onlyPayee
        returns (TokenBalance[] memory tokenBalances)
    {
        return getBalancesWithTokens(new address[](0));
    }

    function getBalancesWithTokens(
        address[] memory tokenAddrs
    ) public view onlyPayee returns (TokenBalance[] memory tokenBalances) {
        tokenAddrs = tokenAddrs.length > 0 ? tokenAddrs : _paymentTokens;

        tokenBalances = new TokenBalance[](tokenAddrs.length + 1);

        // native token
        address tokenAddr = address(0);
        uint256 payeeBalance = _balances[tokenAddr][msg.sender];
        tokenBalances[0] = TokenBalance(tokenAddr, payeeBalance);

        for (uint i = 0; i < tokenAddrs.length; i++) {
            tokenAddr = tokenAddrs[i];
            payeeBalance = _balances[tokenAddr][msg.sender];
            tokenBalances[i + 1] = TokenBalance(tokenAddr, payeeBalance);
        }
    }

    function withdraw(uint256 amount) public virtual onlyPayee {
        withdrawWithTokens(new address[](0), new uint256[](amount));
    }

    function withdrawWithTokens(
        address[] memory tokenAddrs,
        uint256[] memory amounts
    ) public virtual onlyPayee {
        tokenAddrs = tokenAddrs.length > 0 ? tokenAddrs : _paymentTokens;

        calcAllSharesWithTokens(tokenAddrs);
        TokenBalance[] memory tokenBalances = getBalancesWithTokens(tokenAddrs);

        address payee = msg.sender;
        for (uint i = 0; i < tokenBalances.length; i++) {
            address tokenAddr = tokenBalances[i].tokenAddr;
            uint256 payeeBalance = tokenBalances[i].balance;

            if (payeeBalance > 0 && payeeBalance >= amounts[i]) {
                bool _sent = Token.safeTransfer(payee, payeeBalance, tokenAddr);
                if (_sent) _balances[tokenAddr][payee] -= payeeBalance;
            }
        }

        emit Withdrawn(payee, tokenBalances);
    }

    event Withdrawn(address receiver, TokenBalance[] tokenBalances);
    event Receive(address sender, uint256 amount);

    error InvalidData();
    error NoReEntrancy();
    error Unauthorized();

    modifier onlyPayee() {
        if (!_payees.exist(msg.sender)) revert Unauthorized();

        _;
    }
    modifier noReentrant() {
        if (_locked) revert NoReEntrancy();
        _locked = true;
        _;
        _locked = false;
    }

    struct TokenBalance {
        address tokenAddr;
        uint256 balance;
    }

    // End Of Line
    // STORAGE GAPs
    // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps
    uint256[50] private __gap;
}
