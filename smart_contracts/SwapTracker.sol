// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SwapTracker {
    struct Swap {
        address fromToken;
        address toToken;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 timestamp;
        bool success;
    }

    mapping(address => Swap[]) public userSwaps;
    mapping(address => uint256) public totalSwaps;

    event SwapRecorded(
        address indexed user,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 timestamp,
        bool success
    );

    function recordSwap(
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        bool success
    ) external {
        Swap memory newSwap = Swap({
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: toAmount,
            timestamp: block.timestamp,
            success: success
        });

        userSwaps[msg.sender].push(newSwap);
        totalSwaps[msg.sender]++;

        emit SwapRecorded(
            msg.sender,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            block.timestamp,
            success
        );
    }

    function getUserSwaps(address user) external view returns (Swap[] memory) {
        return userSwaps[user];
    }

    function getTotalSwaps(address user) external view returns (uint256) {
        return totalSwaps[user];
    }
}
