export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/' + (import.meta.env.VITE_INFURA_KEY || 'demo'),
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

export const POPULAR_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6417c62f6C3D2B4F95f8a89E75Aa1b1',
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
    logoUrl: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    logoUrl: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
  },
];

export const CRM_PROVIDERS = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: 'fab fa-salesforce',
    color: 'bg-blue-600',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: 'fas fa-hubspot',
    color: 'bg-orange-600',
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    icon: 'fas fa-handshake',
    color: 'bg-green-600',
  },
];

export const TRANSACTION_TYPES = {
  swap: {
    icon: 'fas fa-exchange-alt',
    color: 'crypto-green',
    label: 'Swap',
  },
  send: {
    icon: 'fas fa-arrow-up',
    color: 'crypto-amber',
    label: 'Send',
  },
  receive: {
    icon: 'fas fa-arrow-down',
    color: 'crypto-purple',
    label: 'Receive',
  },
} as const;
