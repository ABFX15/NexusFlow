# NexusFlow - Web3 DeFi Dashboard

A comprehensive Web3 DeFi dashboard with merit-based systems, swap tracking, and blockchain exploration capabilities.

## Features

- **Merit System**: Level progression based on trading activity with rewards
- **Swap Tracking**: Real-time price charts with swap overlay visualization
- **Trading Interface**: Visual token swapping with market data
- **Vault Management**: Token vault interactions with yield tracking
- **Blockchain Explorer**: Address and transaction exploration via Blockscout
- **Portfolio Overview**: Real wallet balance tracking and analytics
- **Multi-Network Support**: Ethereum Mainnet and Sepolia Testnet

## Smart Contracts

- **SwapTracker**: `0x0C319b5d3e894A60607c113bE97e482129De52AF` (Sepolia)
- **TokenVault**: `0x6A6C2A5125735FB2c6F46cF29C94642c735C232e` (Sepolia)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/UI
- **Web3**: Wagmi + Viem + RainbowKit
- **Backend**: Express.js + Node.js
- **Database**: In-memory storage (Drizzle ORM ready)
- **Charts**: Recharts
- **Animations**: Custom CSS + Framer Motion

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nexusflow-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Shadcn UI components
│   │   │   ├── nexus-logo.tsx
│   │   │   ├── merit-dashboard.tsx
│   │   │   ├── swap-tracker.tsx
│   │   │   ├── trading-interface.tsx
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── pages/          # Page components
├── server/                 # Backend Express application
├── shared/                 # Shared types and schemas
└── attached_assets/        # Smart contract files
```

## Key Components

### Merit System

- Level progression: Novice → Trader → Expert → Master → Legend
- Rewards calculation based on trading volume and streaks
- Real-time merit tracking from smart contracts

### Swap Tracker

- Interactive price charts with swap overlay
- Multi-token support (ETH, USDC, DAI, USDT, WBTC, UNI)
- Time range controls (1H, 24H, 7D, 30D)
- Swap history with success indicators

### Trading Interface

- Visual token pair selection
- Real-time market data and rates
- Trading simulation with validation
- Enhanced visual feedback

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Add any API keys or configuration
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Network Configuration

The application supports multiple networks configured in `client/src/lib/wagmi.ts`:

- Ethereum Mainnet
- Sepolia Testnet

## Smart Contract Integration

The dashboard integrates with custom smart contracts:

1. **SwapTracker Contract**: Tracks all user swaps and trading activity
2. **TokenVault Contract**: Manages token deposits, withdrawals, and yield calculations

Both contracts are deployed on Sepolia testnet and include merit-based reward systems.

## Development

### Adding New Components

1. Create component in `client/src/components/`
2. Add to navigation in `client/src/components/sidebar.tsx`
3. Add route in `client/src/pages/dashboard.tsx`

### Styling

- Uses Tailwind CSS with custom NexusFlow theme
- Custom animations and effects in `client/src/index.css`
- Shadcn/UI components for consistent design

### Web3 Integration

- Wallet connection via RainbowKit
- Contract interactions via Wagmi hooks
- Multi-network support with automatic switching

## API Endpoints

- `GET /api/prices` - Real-time token prices
- `GET /api/portfolio/holdings` - User portfolio data
- `GET /api/portfolio/overview` - Portfolio summary
- `POST /api/wallet/balances` - Wallet balance fetching
- `GET /api/transactions` - Transaction history

## License

MIT License - See LICENSE file for details
