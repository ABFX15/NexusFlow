import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenLogo } from "@/components/token-logos";

interface Holding {
  symbol: string;
  name: string;
  amount: string;
  valueUsd: number;
  change24h: number;
  logoUrl?: string;
}

export function Holdings() {
  const { data: holdings, isLoading } = useQuery({
    queryKey: ['/api/portfolio/holdings'],
  });

  if (isLoading) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white">Holdings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 crypto-card rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-white">Holdings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {holdings && holdings.length > 0 ? (
          holdings.map((holding: Holding, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 crypto-card rounded-lg">
              <div className="flex items-center space-x-3">
                <TokenLogo symbol={holding.symbol} className="w-8 h-8" />
                <div>
                  <p className="font-medium text-white">{holding.symbol}</p>
                  <p className="text-sm text-gray-400">{holding.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">
                  {holding.amount} {holding.symbol}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-green-500">
                    ${holding.valueUsd.toLocaleString()}
                  </p>
                  <span className={`text-xs ${holding.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-wallet text-4xl text-gray-500 mb-4"></i>
            <p className="text-gray-400">No holdings found</p>
            <p className="text-sm text-gray-500">Connect your wallet to view your token holdings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
