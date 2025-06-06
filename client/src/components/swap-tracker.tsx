import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAccount } from 'wagmi';
import { useSwapTracker } from "@/hooks/useContracts";
import { TokenLogo } from "@/components/token-logos";
import { formatEther } from 'viem';
import { useQuery } from "@tanstack/react-query";

interface SwapEvent {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: number;
  success: boolean;
  hash?: string;
}

interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  swap?: SwapEvent;
}

const TOKEN_SYMBOLS = ['ETH', 'USDC', 'DAI', 'USDT', 'WBTC', 'UNI'];

export function SwapTracker() {
  const { address, isConnected } = useAccount();
  const { userSwaps, totalSwaps } = useSwapTracker();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [timeRange, setTimeRange] = useState('24h');

  // Generate mock price data with user swaps overlaid
  const generatePriceData = () => {
    const now = Date.now();
    const intervals = {
      '1h': { points: 60, interval: 60000 },
      '24h': { points: 24, interval: 3600000 },
      '7d': { points: 7, interval: 86400000 },
      '30d': { points: 30, interval: 86400000 }
    };

    const config = intervals[timeRange as keyof typeof intervals] || intervals['24h'];
    const basePrice = selectedToken === 'ETH' ? 2463 : selectedToken === 'WBTC' ? 103620 : 1;
    
    const priceData: PricePoint[] = [];
    
    for (let i = config.points; i >= 0; i--) {
      const timestamp = now - (i * config.interval);
      const variation = (Math.random() - 0.5) * 0.04; // 4% max variation
      const price = basePrice * (1 + variation);
      const volume = Math.random() * 1000000;
      
      priceData.push({
        timestamp,
        price,
        volume,
      });
    }

    // Add user swaps to the chart if available
    if (userSwaps && Array.isArray(userSwaps)) {
      userSwaps.forEach((swap: any) => {
        const swapTime = Number(swap.timestamp) * 1000;
        const nearestPoint = priceData.find(point => 
          Math.abs(point.timestamp - swapTime) < config.interval / 2
        );
        
        if (nearestPoint && 
            (swap.fromToken.toLowerCase().includes(selectedToken.toLowerCase()) || 
             swap.toToken.toLowerCase().includes(selectedToken.toLowerCase()))) {
          nearestPoint.swap = {
            fromToken: swap.fromToken,
            toToken: swap.toToken,
            fromAmount: formatEther(swap.fromAmount),
            toAmount: formatEther(swap.toAmount),
            timestamp: swapTime,
            success: swap.success,
          };
        }
      });
    }

    return priceData;
  };

  const priceData = generatePriceData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(label);
      
      return (
        <div className="nexus-card p-3 border">
          <p className="text-white text-sm">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
          <p className="text-blue-400">
            Price: ${data.price.toFixed(2)}
          </p>
          <p className="text-gray-400">
            Volume: ${(data.volume / 1000000).toFixed(2)}M
          </p>
          {data.swap && (
            <div className="mt-2 p-2 bg-purple-500/20 rounded">
              <p className="text-purple-300 text-xs font-bold">YOUR SWAP</p>
              <p className="text-white text-xs">
                {parseFloat(data.swap.fromAmount).toFixed(4)} → {parseFloat(data.swap.toAmount).toFixed(4)}
              </p>
              <Badge className={data.swap.success ? 'bg-green-500' : 'bg-red-500'}>
                {data.swap.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!isConnected) {
    return (
      <Card className="nexus-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="nexus-glow text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
            <p className="text-gray-400">Connect your wallet to track your swap history on price charts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card className="nexus-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <span className="text-2xl mr-3 nexus-glow">📈</span>
              Swap Tracking Chart
            </span>
            <Badge className="nexus-pulse bg-purple-500">
              {Number(totalSwaps || 0)} Total Swaps
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Token:</label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKEN_SYMBOLS.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>
                      <div className="flex items-center space-x-2">
                        <TokenLogo symbol={symbol} className="w-4 h-4" />
                        <span>{symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Range:</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1H</SelectItem>
                  <SelectItem value="24h">24H</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Chart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5200FF" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="#9CA3AF"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#00D4FF"
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                  strokeWidth={2}
                />
                {/* Swap points */}
                <Line
                  type="monotone"
                  dataKey={(data: PricePoint) => data.swap ? data.price : null}
                  stroke="#FF0080"
                  strokeWidth={4}
                  dot={{ fill: '#FF0080', strokeWidth: 2, r: 6 }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Swap History */}
      <Card className="nexus-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-3">📋</span>
            Recent Swaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userSwaps && Array.isArray(userSwaps) && userSwaps.length > 0 ? (
            <div className="space-y-3">
              {userSwaps.slice(0, 5).map((swap: any, index: number) => (
                <div key={index} className="nexus-stat-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <TokenLogo symbol="ETH" className="w-5 h-5" />
                        <span className="text-xs">→</span>
                        <TokenLogo symbol="USDC" className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {parseFloat(formatEther(swap.fromAmount)).toFixed(4)} → {parseFloat(formatEther(swap.toAmount)).toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(Number(swap.timestamp) * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={swap.success ? 'bg-green-500' : 'bg-red-500'}>
                      {swap.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">No Swaps Yet</h3>
              <p className="text-gray-400">Start trading to see your swap history on the price chart</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}