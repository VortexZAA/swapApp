// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Open Zeppelin libraries for controlling upgradability and access.
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "../v1/token/ERC721Referable.sol";
import "../v1/token/Token.sol";
import "../v1/util/StringHelper.sol";
import "../v1/util/ArrayFind.sol";
import "../v1/util/ArrayRemove.sol";
import "../v1/util/Error.sol";
import "../v1/access/Authorizer.sol";
import "../v1/money/SingleCashCollector.sol";

import "hardhat/console.sol";

contract MoseikiDomainNFT is
    Initializable,
    ERC721Referable,
    OwnableUpgradeable,
    SingleCashCollector
{
    mapping(bytes32 => uint256) private _prices;
    mapping(bytes32 => uint256) private _nativePrices;

    using StringHelper for string;
    using ArrayFind for string[];
    using ArrayRemove for string[];

    string[] public _domainNames;
    mapping(string => DomainInfo) public _nameToDomainInfo;
    mapping(address => string[]) public _holderToDomainNames;
    mapping(uint256 => string) public _tokenIdToDomainName;

    function initialize(
        string calldata nftName,
        string calldata nftSymbol,
        address[] calldata paymentTokens
    ) public virtual initializer {
        __Ownable_init();
        __ERC721Referable_init(nftName, nftSymbol);
        __SingleCashCollector_init(address(this), paymentTokens);
    }

    // WRITE
    function setPrice(
        bytes32 tag,
        uint256 price,
        uint256 priceNative
    ) public virtual onlyOwner {
        _prices[tag] = price;
        _nativePrices[tag] = priceNative;
    }

    function setBaseURI(string calldata uri) public virtual onlyOwner {
        _baseUri = uri;
    }

    function registerAll(CreateDomainModel[] calldata domains)
        public
        virtual
        onlyOwner
    {
        for (uint256 i = 0; i < domains.length; i++) _register(domains[i]);
    }

    function _register(CreateDomainModel calldata domain) internal virtual {
        Error.checkEmpty(domain.domainName);

        uint256 price = _prices[domain.priceTag];
        uint256 priceNative = _nativePrices[domain.priceTag];
        if (price == 0 && priceNative == 0) revert PriceNotSet();

        DomainInfo memory info = _nameToDomainInfo[domain.domainName];

        if (info.holder != address(0)) revert DomainAlreadyRegistered();
        if (isFrozen(domain.domainName, false)) revert DomainIsFrozen();

        if (msg.value > 0) {
            // User is paying with the chain's native token
            require(
                msg.value == priceNative,
                "Incorrect amount of native token sent"
            );
        } else {
            // User is paying with the specified payment token
            _isPaymentToken(domain.paymentToken, true);
            Token.safeTransferFrom(
                domain.holder,
                address(this),
                price,
                domain.paymentToken
            );
        }

        // mint
        uint256 tokenId = refMint(
            domain.holder,
            domain.domainName.toHash(),
            domain.tokenURI
        );
        _nameToDomainInfo[domain.domainName] = DomainInfo(
            domain.domainName,
            domain.holder,
            domain.tokenURI,
            tokenId,
            uint32(block.timestamp),
            0,
            0
        );
        _tokenIdToDomainName[tokenId] = domain.domainName;
        _domainNames.push(domain.domainName);
        _holderToDomainNames[domain.holder].push(domain.domainName);

        emit OnRegister(
            domain.domainName,
            domain.holder,
            domain.tokenURI,
            tokenId
        );
    }

    function registerByOwner(CreateDomainModel calldata domain)
        internal
        virtual
        onlyOwner
    {
        _register(domain);
    }

    function register(CreateDomainModel calldata domain) public payable  virtual {
        _register(domain);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        (batchSize);

        string memory domainName = _tokenIdToDomainName[tokenId];
        // if domain not found
        if (bytes(domainName).length == 0) return;

        _nameToDomainInfo[domainName].holder = to;
        if (from != address(0)) _holderToDomainNames[from].remove(domainName);
        if (to != address(0)) _holderToDomainNames[to].push(domainName);
    }

    function suspend(string calldata domainName)
        public
        virtual
        onlyHolder(domainName)
    {
        setSuspendTime(domainName, uint32(block.timestamp));
    }

    function isFrozen(string calldata domainName, bool revertIfExpired)
        public
        virtual
        returns (bool)
    {
        bool isExpired = expired(domainName, revertIfExpired);
        return _nameToDomainInfo[domainName].suspendTime != 0 && !isExpired;
    }

    function setSuspendTime(string calldata domainName, uint32 time)
        public
        virtual
        onlyHolder(domainName)
    {
        DomainInfo memory info = _nameToDomainInfo[domainName];
        if (info.holder == address(0)) revert DomainNotFound();

        bool frozen = isFrozen(domainName, true); // frozen and expire checking
        if (time > 0 && frozen) revert DomainIsFrozen();

        _nameToDomainInfo[domainName].suspendTime = time;

        if (time > 0) emit OnSuspend(domainName);
        else emit OnResume(domainName);
    }

    function resume(string calldata domainName)
        public
        virtual
        onlyHolder(domainName)
    {
        setSuspendTime(domainName, 0);
    }

    function expired(string calldata domainName, bool revert_)
        public
        virtual
        returns (bool)
    {
        DomainInfo memory info = _nameToDomainInfo[domainName];

        bool isExpired = false;
        uint32 currentTime = uint32(block.timestamp);
        if (
            info.suspendTime == 0 &&
            (info.expirationTime > 0 && currentTime > info.expirationTime)
        ) {
            isExpired = true;
        } else if (info.suspendTime > 0) {
            uint32 suspendExpirationTime = uint32(info.suspendTime + 30 days);

            if (currentTime > suspendExpirationTime) isExpired = true;
        }

        if (isExpired) {
            _holderToDomainNames[info.holder].remove(domainName);

            DomainInfo storage dinfo = _nameToDomainInfo[domainName];
            dinfo.holder = address(0);
            dinfo.expirationTime = 0;
            dinfo.suspendTime = 0;

            emit OnExpire(domainName);

            if (revert_) revert DomainIsExpired();
        }

        return isExpired;
    }

    // READ
    function getSuspendTime(string calldata domainName)
        public
        view
        virtual
        returns (uint32)
    {
        exist(domainName, true);

        return _nameToDomainInfo[domainName].suspendTime;
    }

    function exist(string calldata domainName, bool revert_)
        public
        view
        virtual
        returns (bool)
    {
        bool found = _nameToDomainInfo[domainName].tokenId > 0;
        if (!found && revert_) revert DomainNotFound();

        return found;
    }

    function getDomainInfo(string calldata domainName)
        public
        view
        virtual
        returns (DomainInfo memory)
    {
        return _nameToDomainInfo[domainName];
    }

    function getDomainInfo(uint256 tokenId)
        public
        view
        virtual
        returns (DomainInfo memory)
    {
        return _nameToDomainInfo[_tokenIdToDomainName[tokenId]];
    }

    function getHolder(string calldata domainName)
        public
        view
        virtual
        returns (address)
    {
        return _nameToDomainInfo[domainName].holder;
    }

    function getHolder(uint256 tokenId) public view virtual returns (address) {
        return _nameToDomainInfo[_tokenIdToDomainName[tokenId]].holder;
    }

    function getDomainInfos(string[] calldata domainNames)
        public
        view
        virtual
        returns (DomainInfo[] memory)
    {
        DomainInfo[] memory myDomains = new DomainInfo[](domainNames.length);
        for (uint256 i = 0; i < domainNames.length; i++) {
            string calldata domainName = domainNames[i];

            myDomains[i] = _nameToDomainInfo[domainName];
        }

        return myDomains;
    }

    function getDomains(address holder)
        public
        view
        virtual
        returns (string[] memory)
    {
        return _holderToDomainNames[holder];
    }

    // ERRORs
    error DomainNotFound();
    error DomainAlreadyRegistered();
    error DomainNotCreated();
    error AlreadyExist();
    error OnlyDomainHolder();
    error DomainIsFrozen();
    error DomainIsExpired();
    error PriceNotSet();

    // MODIFIERs
    modifier onlyHolder(string calldata domainName) {
        if (
            _nameToDomainInfo[domainName].holder != msg.sender &&
            msg.sender != owner()
        ) revert OnlyDomainHolder();

        _;
    }

    // EVENTs
    event OnRegister(
        string domainName,
        address holder,
        string tokenURI,
        uint256 tokenId
    );
    event OnExpire(string domainName);
    event OnSuspend(string domainName);
    event OnResume(string domainName);


    uint256[50] private __gap;
}

struct DomainInfo {
    string domainName;
    address holder;
    string tokenURI;
    uint256 tokenId;
    uint32 registrationTime;
    uint32 expirationTime;
    uint32 suspendTime;
}

struct CreateDomainModel {
    string domainName;
    address holder;
    string tokenURI;
    bytes32 priceTag;
    address paymentToken;
}

