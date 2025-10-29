// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract PriceOracle {
    mapping(address => address) public priceFeeds;
    mapping(address => uint256) public fixedPrices;
    mapping(address => bool) public isFixedPrice;
    
    address public admin;
    uint256 public constant PRICE_DECIMALS = 8;

    event PriceFeedSet(address indexed token, address indexed priceFeed);
    event FixedPriceSet(address indexed token, uint256 price);
    event PriceTypeChanged(address indexed token, bool isFixed);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setPriceFeed(address token, address priceFeed) external onlyAdmin {
        priceFeeds[token] = priceFeed;
        isFixedPrice[token] = false;
        emit PriceFeedSet(token, priceFeed);
    }

    function setFixedPrice(address token, uint256 price) external onlyAdmin {
        fixedPrices[token] = price;
        isFixedPrice[token] = true;
        emit FixedPriceSet(token, price);
    }

    function getPrice(address token) public view returns (uint256) {
        if (isFixedPrice[token]) {
            return fixedPrices[token];
        } else {
            address priceFeed = priceFeeds[token];
            require(priceFeed != address(0), "No price feed set");
            
            (, int256 price, , , ) = AggregatorV3Interface(priceFeed).latestRoundData();
            require(price > 0, "Invalid price");
            
            return uint256(price);
        }
    }

    function convertPrice(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256) {
        uint256 fromPrice = getPrice(fromToken);
        uint256 toPrice = getPrice(toToken);
        
        return (amount * fromPrice) / toPrice;
    }

    function getPriceInUSD(address token, uint256 amount) external view returns (uint256) {
        uint256 tokenPrice = getPrice(token);
        return (amount * tokenPrice) / (10 ** PRICE_DECIMALS);
    }

    function getMultiplePrices(address[] calldata tokens) external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            prices[i] = getPrice(tokens[i]);
        }
        return prices;
    }

    function setPriceType(address token, bool fixedPrice) external onlyAdmin {
        isFixedPrice[token] = fixedPrice;
        emit PriceTypeChanged(token, fixedPrice);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}