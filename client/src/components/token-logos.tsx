export function EthereumLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="eth-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#627EEA" />
          <stop offset="100%" stopColor="#8A92B2" />
        </linearGradient>
      </defs>
      <path d="M12 2L5.5 12.5L12 16L18.5 12.5L12 2Z" fill="url(#eth-gradient)" />
      <path d="M12 16L5.5 12.5L12 22L18.5 12.5L12 16Z" fill="url(#eth-gradient)" opacity="0.8" />
    </svg>
  );
}

export function UsdcLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#2775CA" />
      <circle cx="12" cy="12" r="7" fill="white" />
      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="#2775CA" fontWeight="bold">USDC</text>
    </svg>
  );
}

export function DaiLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#F5AC37" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">DAI</text>
    </svg>
  );
}

export function UsdtLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#26A17B" />
      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">USDT</text>
    </svg>
  );
}

export function WbtcLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#F7931A" />
      <path d="M16 8.5c0-1.5-1-2.5-3-2.5H9v9h4c2 0 3-1 3-2.5v-4z" fill="white" />
      <path d="M10.5 7.5h2c0.5 0 1 0.5 1 1s-0.5 1-1 1h-2v-2z" fill="#F7931A" />
      <path d="M10.5 10.5h2.5c0.5 0 1 0.5 1 1s-0.5 1-1 1h-2.5v-2z" fill="#F7931A" />
    </svg>
  );
}

export function UniLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="uni-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF007A" />
          <stop offset="100%" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#uni-gradient)" />
      <path d="M8 16c2-2 4-2 6 0-2-4-4-4-6 0z" fill="white" />
      <circle cx="15" cy="9" r="2" fill="white" />
    </svg>
  );
}

export function TokenLogo({ symbol, className = "w-6 h-6" }: { symbol: string; className?: string }) {
  switch (symbol.toUpperCase()) {
    case 'ETH':
    case 'WETH':
      return <EthereumLogo className={className} />;
    case 'USDC':
      return <UsdcLogo className={className} />;
    case 'DAI':
      return <DaiLogo className={className} />;
    case 'USDT':
      return <UsdtLogo className={className} />;
    case 'WBTC':
      return <WbtcLogo className={className} />;
    case 'UNI':
      return <UniLogo className={className} />;
    default:
      return (
        <div className={`${className} rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold`}>
          {symbol.charAt(0)}
        </div>
      );
  }
}