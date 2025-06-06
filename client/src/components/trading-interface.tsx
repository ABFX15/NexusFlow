import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TokenLogo } from "@/components/token-logos";
import { useAccount } from 'wagmi';
import { useToast } from "@/hooks/use-toast";

const TRADING_PAIRS = [
  { from: 'ETH', to: 'USDC', rate: 2463.68, change: '+1.2%' },
  { from: 'WBTC', to: 'ETH', rate: 42.1, change: '+0.8%' },
  { from: 'USDC', to: 'DAI', rate: 1.0001, change: '+0.01%' },
  { from: 'UNI', to: 'ETH', rate: 0.0034, change: '+2.5%' },
];

const MARKET_DATA = [
  { symbol: 'ETH', price: 2463.68, change: '+1.2%', volume: '2.1B' },
  { symbol: 'WBTC', price: 103618, change: '+0.8%', volume: '890M' },
  { symbol: 'USDC', price: 1.00, change: '+0.01%', volume: '4.2B' },
  { symbol: 'UNI', price: 8.42, change: '+2.5%', volume: '156M' },
];

export function TradingInterface() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [amount, setAmount] = useState('');

  const handleTrade = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to start trading",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trading amount",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Trade Simulation",
      description: `Simulated trade: ${amount} ${selectedPair.from} → ${selectedPair.to}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Trading Interface */}
      <Card className="nexus-card">
        <div className="nexus-bg absolute inset-0 opacity-10" />
        <CardHeader className="relative">
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-3 nexus-glow">⚡</span>
            Quick Trade
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Trading Pairs */}
          <div className="grid grid-cols-2 gap-2">
            {TRADING_PAIRS.map((pair, index) => (
              <Button
                key={`${pair.from}-${pair.to}`}
                variant={selectedPair === pair ? "default" : "outline"}
                className={`p-3 h-auto ${selectedPair === pair ? 'nexus-button' : 'border-gray-600'}`}
                onClick={() => setSelectedPair(pair)}
              >
                <div className="flex items-center space-x-2">
                  <TokenLogo symbol={pair.from} className="w-4 h-4" />
                  <span className="text-xs">→</span>
                  <TokenLogo symbol={pair.to} className="w-4 h-4" />
                  <div className="ml-2">
                    <div className="text-xs font-bold">{pair.from}/{pair.to}</div>
                    <div className="text-xs text-green-400">{pair.change}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Trade Input */}
          <div className="space-y-3">
            <div className="nexus-stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">From</span>
                <div className="flex items-center space-x-2">
                  <TokenLogo symbol={selectedPair.from} className="w-5 h-5" />
                  <span className="text-white font-bold">{selectedPair.from}</span>
                </div>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white text-lg"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 nexus-gradient rounded-full flex items-center justify-center nexus-glow">
                <span className="text-white text-sm">↓</span>
              </div>
            </div>

            <div className="nexus-stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">To</span>
                <div className="flex items-center space-x-2">
                  <TokenLogo symbol={selectedPair.to} className="w-5 h-5" />
                  <span className="text-white font-bold">{selectedPair.to}</span>
                </div>
              </div>
              <div className="text-lg text-white bg-gray-800 rounded px-3 py-2 border border-gray-600">
                {amount ? (parseFloat(amount) * selectedPair.rate).toFixed(6) : '0.00'}
              </div>
            </div>

            <Button 
              onClick={handleTrade}
              className="nexus-button w-full"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <span className="mr-2">🚀</span>
              Execute Trade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <Card className="nexus-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-3">📊</span>
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MARKET_DATA.map((token) => (
              <div key={token.symbol} className="nexus-stat-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TokenLogo symbol={token.symbol} className="w-6 h-6" />
                    <span className="font-bold text-white">{token.symbol}</span>
                  </div>
                  <Badge className={token.change.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}>
                    {token.change}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-white nexus-counter">
                  ${token.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Volume: ${token.volume}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Stats */}
      <Card className="nexus-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-3">📈</span>
            Trading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">🔥</div>
              <div className="text-xl font-bold text-white nexus-counter">24h</div>
              <div className="text-sm text-gray-400">Trading Volume</div>
            </div>
            
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">⚡</div>
              <div className="text-xl font-bold text-white nexus-counter">0.05%</div>
              <div className="text-sm text-gray-400">Trading Fee</div>
            </div>
            
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">🎯</div>
              <div className="text-xl font-bold text-white nexus-counter">Instant</div>
              <div className="text-sm text-gray-400">Execution</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}