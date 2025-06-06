// Contract addresses - will work with mainnet wallet connection
export const CONTRACT_ADDRESSES = {
  SWAP_TRACKER: '0x0C319b5d3e894A60607c113bE97e482129De52AF', // Sepolia deployment
  TOKEN_VAULT: '0x6A6C2A5125735FB2c6F46cF29C94642c735C232e', // Sepolia deployment
};

// SwapTracker ABI
export const SWAP_TRACKER_ABI = [
  {
    "type": "function",
    "name": "recordSwap",
    "inputs": [
      {"name": "fromToken", "type": "address"},
      {"name": "toToken", "type": "address"},
      {"name": "fromAmount", "type": "uint256"},
      {"name": "toAmount", "type": "uint256"},
      {"name": "success", "type": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserSwaps",
    "inputs": [{"name": "user", "type": "address"}],
    "outputs": [
      {
        "type": "tuple[]",
        "components": [
          {"name": "fromToken", "type": "address"},
          {"name": "toToken", "type": "address"},
          {"name": "fromAmount", "type": "uint256"},
          {"name": "toAmount", "type": "uint256"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "success", "type": "bool"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalSwaps",
    "inputs": [{"name": "user", "type": "address"}],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "SwapRecorded",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true},
      {"name": "fromToken", "type": "address", "indexed": false},
      {"name": "toToken", "type": "address", "indexed": false},
      {"name": "fromAmount", "type": "uint256", "indexed": false},
      {"name": "toAmount", "type": "uint256", "indexed": false},
      {"name": "timestamp", "type": "uint256", "indexed": false},
      {"name": "success", "type": "bool", "indexed": false}
    ]
  }
] as const;

// TokenVault ABI (partial - key functions only)
export const TOKEN_VAULT_ABI = [
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserPositions",
    "inputs": [{"name": "user", "type": "address"}],
    "outputs": [
      {
        "type": "tuple[]",
        "components": [
          {"name": "token", "type": "address"},
          {"name": "amount", "type": "uint256"},
          {"name": "entryPrice", "type": "uint256"},
          {"name": "lastUpdate", "type": "uint256"},
          {"name": "accumulatedYield", "type": "uint256"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculateYield",
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "token", "type": "address"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculateRewards",
    "inputs": [{"name": "user", "type": "address"}],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "PositionOpened",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true},
      {"name": "token", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false},
      {"name": "entryPrice", "type": "uint256", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "PositionClosed",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true},
      {"name": "token", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false},
      {"name": "exitPrice", "type": "uint256", "indexed": false}
    ]
  }
] as const;

// Common token addresses
export const TOKEN_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
} as const;

// ERC20 ABI (standard functions needed for token interactions)
export const ERC20_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "account", "type": "address"}],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"type": "uint8"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"type": "string"}],
    "stateMutability": "view"
  }
] as const;