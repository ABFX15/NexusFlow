import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "./wallet-connect";
import { NexusLogo, NexusWordmark } from "./nexus-logo";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const [prices, setPrices] = useState({
    eth: 0,
    btc: 0,
  });

  // Fetch real-time prices
  const { data: priceData } = useQuery({
    queryKey: ['/api/prices'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (priceData) {
      setPrices(priceData);
    }
  }, [priceData]);

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 nexus-bg opacity-5"></div>
      <div className="px-6 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <NexusLogo className="w-8 h-8" />
              <NexusWordmark className="text-xl" />
            </div>
            <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Ethereum Mainnet
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time price ticker */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <span className="text-gray-400">ETH:</span>
              <span className="text-green-500 font-mono">
                ${prices.eth ? prices.eth.toLocaleString() : '--'}
              </span>
              <span className="text-gray-400">BTC:</span>
              <span className="text-green-500 font-mono">
                ${prices.btc ? prices.btc.toLocaleString() : '--'}
              </span>
            </div>
            
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}
