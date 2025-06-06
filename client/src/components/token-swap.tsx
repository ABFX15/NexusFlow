import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount, useBalance } from 'wagmi';
import { apiRequest } from "@/lib/queryClient";
import { POPULAR_TOKENS } from "@/lib/constants";
import { useSwapTracker } from "@/hooks/useContracts";
import { TOKEN_ADDRESSES } from "@/lib/contracts";

interface SwapData {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  gasEstimate: string;
}

export function TokenSwap() {
  const [swapData, setSwapData] = useState<SwapData>({
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    gasEstimate: '',
  });

  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  // Get ETH balance using Wagmi
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Fetch swap quote
  const { data: quoteData, isLoading: quoteLoading } = useQuery({
    queryKey: ['/api/swap/quote', swapData.fromToken, swapData.toToken, swapData.fromAmount],
    enabled: !!(swapData.fromAmount && parseFloat(swapData.fromAmount) > 0),
  });

  // Fetch token balances
  const { data: balances } = useQuery({
    queryKey: ['/api/wallet/balances', address],
    queryFn: () => apiRequest('POST', '/api/wallet/balances', { walletAddress: address }),
    enabled: isConnected && !!address,
  });

  const swapMutation = useMutation({
    mutationFn: async (data: SwapData) => {
      return apiRequest('POST', '/api/swap/execute', {
        ...data,
        walletAddress: address,
      });
    },
    onSuccess: () => {
      toast({
        title: "Swap Successful",
        description: "Your token swap has been executed successfully",
      });
      setSwapData(prev => ({ ...prev, fromAmount: '', toAmount: '' }));
    },
    onError: (error: any) => {
      toast({
        title: "Swap Failed",
        description: error.message || "Failed to execute swap",
        variant: "destructive",
      });
    },
  });

  const handleAmountChange = (value: string) => {
    setSwapData(prev => ({ ...prev, fromAmount: value }));
  };

  const reverseSwap = () => {
    setSwapData(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  };

  const executeSwap = async () => {
    if (!swapData.fromAmount || parseFloat(swapData.fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive",
      });
      return;
    }

    swapMutation.mutate(swapData);
  };

  const getTokenBalance = (symbol: string) => {
    if (symbol === 'ETH' && ethBalance) {
      return ethBalance.formatted;
    }
    return (balances as any)?.[symbol] || '0.0';
  };

  const getTokenIcon = (symbol: string) => {
    const token = POPULAR_TOKENS.find(t => t.symbol === symbol);
    return token?.logoUrl;
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <i className="fas fa-exchange-alt mr-2 text-purple-500"></i>
          Token Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <Label className="text-gray-400">From</Label>
          <div className="crypto-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Select value={swapData.fromToken} onValueChange={(value) => setSwapData(prev => ({ ...prev, fromToken: value }))}>
                <SelectTrigger className="w-auto bg-gray-600 border-gray-500">
                  <div className="flex items-center space-x-2">
                    {getTokenIcon(swapData.fromToken) && (
                      <img src={getTokenIcon(swapData.fromToken)} alt={swapData.fromToken} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-medium">{swapData.fromToken}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <img src={token.logoUrl} alt={token.symbol} className="w-5 h-5 rounded-full" />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-400">
                Balance: {getTokenBalance(swapData.fromToken)}
              </span>
            </div>
            <Input
              type="text"
              placeholder="0.0"
              value={swapData.fromAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="bg-transparent text-2xl font-mono text-white border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={reverseSwap}
            className="w-10 h-10 crypto-gradient rounded-full hover:opacity-80"
          >
            <i className="fas fa-arrow-down text-white"></i>
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label className="text-gray-400">To</Label>
          <div className="crypto-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Select value={swapData.toToken} onValueChange={(value) => setSwapData(prev => ({ ...prev, toToken: value }))}>
                <SelectTrigger className="w-auto bg-gray-600 border-gray-500">
                  <div className="flex items-center space-x-2">
                    {getTokenIcon(swapData.toToken) && (
                      <img src={getTokenIcon(swapData.toToken)} alt={swapData.toToken} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-medium">{swapData.toToken}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <img src={token.logoUrl} alt={token.symbol} className="w-5 h-5 rounded-full" />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-400">
                Balance: {getTokenBalance(swapData.toToken)}
              </span>
            </div>
            <Input
              type="text"
              placeholder="0.0"
              value={(quoteData as any)?.toAmount || ''}
              readOnly
              className="bg-transparent text-2xl font-mono text-white border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Swap Details */}
        {quoteData && (
          <div className="crypto-card rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="text-white font-mono">{(quoteData as any).rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slippage</span>
              <span className="text-white">{swapData.slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gas Fee</span>
              <span className="text-white font-mono">~${(quoteData as any).gasEstimate}</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={executeSwap}
          disabled={!swapData.fromAmount || swapMutation.isPending || quoteLoading}
          className="w-full crypto-gradient border-0 text-white hover:opacity-90"
        >
          {swapMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Swapping...
            </>
          ) : (
            'Swap Tokens'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
