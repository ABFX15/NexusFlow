// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface I1inchPriceOracle {
    function getRate(
        address srcToken,
        address dstToken
    ) external view returns (uint256);
}

contract TokenVault is Ownable, ReentrancyGuard {
    struct Position {
        address token;
        uint256 amount;
        uint256 entryPrice;
        uint256 lastUpdate;
        uint256 accumulatedYield;
    }

    struct UserStats {
        uint256 totalVolume;
        uint256 lastRewardTimestamp;
        uint256 accumulatedRewards;
        uint256 tradingStreak;
    }

    error TokenVault__InvalidAddress();
    error TokenVault__InsufficientBalance();
    error TokenVault__PositionNotFound();
    error TokenVault__TransferFailed();
    error TokenVault__NoRewardsAvailable();

    // Mapping of user address to their positions
    mapping(address => Position[]) public userPositions;

    // Mapping of token address to total deposited amount
    mapping(address => uint256) public totalDeposits;

    // Common token addresses on Ethereum mainnet
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public constant WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    // 1inch price oracle address on Ethereum mainnet
    address public constant INCH_ORACLE =
        0x07d91f5FB9b7797835Dc3f7b0C0C0C0C0c0C0c0c;

    // Mapping to track if a token is supported
    mapping(address => bool) public supportedTokens;

    // User statistics and rewards
    mapping(address => UserStats) public userStats;
    uint256 public constant REWARD_RATE = 50; // 0.5% reward rate
    uint256 public constant MIN_VOLUME_FOR_REWARD = 1000 ether; // Minimum volume for rewards
    uint256 public constant REWARD_INTERVAL = 1 days; // Daily rewards
    uint256 public constant STREAK_BONUS = 10; // 0.1% bonus per day in streak

    // Events
    event PositionOpened(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 entryPrice
    );
    event PositionClosed(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 exitPrice
    );
    event YieldClaimed(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event RewardsClaimed(address indexed user, uint256 amount);
    event TradingStreakUpdated(address indexed user, uint256 streak);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    constructor() Ownable(msg.sender) {
        // Initialize with common tokens
        supportedTokens[WETH] = true;
        supportedTokens[USDC] = true;
        supportedTokens[DAI] = true;
        supportedTokens[USDT] = true;
        supportedTokens[WBTC] = true;
    }

    function addToken(address token) external onlyOwner {
        if (token == address(0)) revert TokenVault__InvalidAddress();
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeToken(address token) external onlyOwner {
        if (token == address(0)) revert TokenVault__InvalidAddress();
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function getPositionIndex(
        address user,
        address token
    ) internal view returns (uint256) {
        Position[] storage positions = userPositions[user];
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].token == token) {
                return i;
            }
        }
        revert TokenVault__PositionNotFound();
    }

    function getTokenPrice(address token) public view returns (uint256) {
        if (!supportedTokens[token]) revert TokenVault__InvalidAddress();
        if (token == WETH) return 1 ether; // WETH is our base token

        I1inchPriceOracle priceOracle = I1inchPriceOracle(INCH_ORACLE);
        try priceOracle.getRate(token, WETH) returns (uint256 rate) {
            return rate;
        } catch {
            revert TokenVault__InvalidAddress();
        }
    }

    function _updateUserStats(address user, uint256 volume) internal {
        UserStats storage stats = userStats[user];
        stats.totalVolume += volume;

        // Update trading streak
        if (block.timestamp - stats.lastRewardTimestamp <= REWARD_INTERVAL) {
            stats.tradingStreak += 1;
            emit TradingStreakUpdated(user, stats.tradingStreak);
        } else {
            stats.tradingStreak = 1;
            emit TradingStreakUpdated(user, 1);
        }
    }

    function calculateRewards(address user) public view returns (uint256) {
        UserStats storage stats = userStats[user];
        if (stats.totalVolume < MIN_VOLUME_FOR_REWARD) return 0;

        uint256 baseReward = (stats.totalVolume * REWARD_RATE) / 10000; // 0.5%
        uint256 streakBonus = (baseReward *
            stats.tradingStreak *
            STREAK_BONUS) / 10000; // 0.1% per day

        return baseReward + streakBonus;
    }

    function claimRewards() external nonReentrant {
        UserStats storage stats = userStats[msg.sender];
        if (block.timestamp - stats.lastRewardTimestamp < REWARD_INTERVAL) {
            revert TokenVault__NoRewardsAvailable();
        }

        uint256 rewards = calculateRewards(msg.sender);
        if (rewards == 0) revert TokenVault__NoRewardsAvailable();

        stats.accumulatedRewards += rewards;
        stats.lastRewardTimestamp = block.timestamp;
        stats.totalVolume = 0; // Reset volume after claiming

        // Transfer rewards in WETH
        bool success = IERC20(WETH).transfer(msg.sender, rewards);
        if (!success) revert TokenVault__TransferFailed();

        emit RewardsClaimed(msg.sender, rewards);
    }

    function deposit(address token, uint256 amount) external nonReentrant {
        if (!supportedTokens[token]) revert TokenVault__InvalidAddress();
        if (amount == 0) revert TokenVault__InsufficientBalance();

        IERC20 tokenContract = IERC20(token);
        if (tokenContract.allowance(msg.sender, address(this)) < amount) {
            revert TokenVault__InsufficientBalance();
        }

        uint256 volumeInWETH = (amount * getTokenPrice(token)) / 1e18;
        _updateUserStats(msg.sender, volumeInWETH);

        totalDeposits[token] += amount;
        bool success = tokenContract.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) revert TokenVault__TransferFailed();

        userPositions[msg.sender].push(
            Position({
                token: token,
                amount: amount,
                entryPrice: getTokenPrice(token),
                lastUpdate: block.timestamp,
                accumulatedYield: 0
            })
        );
        emit PositionOpened(msg.sender, token, amount, getTokenPrice(token));
    }

    function withdraw(address token, uint256 amount) external nonReentrant {
        if (!supportedTokens[token]) revert TokenVault__InvalidAddress();
        if (amount == 0) revert TokenVault__InsufficientBalance();

        uint256 positionIndex = getPositionIndex(msg.sender, token);
        Position storage position = userPositions[msg.sender][positionIndex];

        if (position.amount < amount) revert TokenVault__InsufficientBalance();

        uint256 volumeInWETH = (amount * getTokenPrice(token)) / 1e18;
        _updateUserStats(msg.sender, volumeInWETH);

        totalDeposits[token] -= amount;
        bool success = IERC20(token).transfer(msg.sender, amount);
        if (!success) revert TokenVault__TransferFailed();

        if (position.amount == amount) {
            userPositions[msg.sender][positionIndex] = userPositions[
                msg.sender
            ][userPositions[msg.sender].length - 1];
            userPositions[msg.sender].pop();
        } else {
            position.amount -= amount;
        }

        emit PositionClosed(msg.sender, token, amount, position.entryPrice);
    }

    function claimYield(address token) external nonReentrant {
        if (token == address(0)) {
            revert TokenVault__InvalidAddress();
        }

        uint256 positionIndex = getPositionIndex(msg.sender, token);
        Position storage position = userPositions[msg.sender][positionIndex];
        uint256 yield = calculateYield(msg.sender, token);
        position.accumulatedYield += yield;
        position.lastUpdate = block.timestamp;
        emit YieldClaimed(msg.sender, token, yield);
    }

    function getUserPositions(
        address user
    ) external view returns (Position[] memory) {
        return userPositions[user];
    }

    function calculateYield(
        address user,
        address token
    ) public view returns (uint256) {
        uint256 positionIndex = getPositionIndex(user, token);
        Position storage position = userPositions[user][positionIndex];
        uint256 currentPrice = getTokenPrice(token);
        uint256 entryPrice = position.entryPrice;
        uint256 amount = position.amount;
        return (currentPrice - entryPrice) * amount;
    }
}
