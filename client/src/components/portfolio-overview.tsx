import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from 'wagmi';
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor: string;
}

function MetricCard({ title, value, change, changeType, icon, iconColor }: MetricCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-500' : 
                     changeType === 'negative' ? 'text-red-500' : 'text-yellow-500';

  return (
    <Card className="relative overflow-hidden border-0 transition-all duration-500 hover:scale-105 hover:shadow-2xl nexus-card">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-pink-500/10"></div>
      <CardContent className="relative p-6 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white font-mono mt-2 nexus-counter">{value}</p>
            <p className={`text-sm font-medium mt-1 ${changeColor}`}>{change}</p>
          </div>
          <div className="relative">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 backdrop-blur-sm">
              {title === 'Total Portfolio Value' && (
                <svg className="w-7 h-7 text-green-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {title === 'Active Swaps' && (
                <svg className="w-7 h-7 text-cyan-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5a1 1 0 000 2h5.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              )}
              {title === 'Gas Saved' && (
                <svg className="w-7 h-7 text-yellow-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-sm -z-10"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioOverview() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio/overview', address, chainId],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/portfolio/overview', { 
        walletAddress: address,
        chainId: chainId 
      });
      return response.json();
    },
    enabled: isConnected && !!address,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="crypto-card">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <MetricCard
        title="Total Portfolio Value"
        value={!isConnected ? 'Connect Wallet' : portfolioData?.totalValue ? `$${portfolioData.totalValue.toLocaleString()}` : '$0.00'}
        change={!isConnected ? '' : portfolioData?.dailyChange ? `${portfolioData.dailyChange > 0 ? '+' : ''}${portfolioData.dailyChange.toFixed(2)}% (24h)` : '0% (24h)'}
        changeType={portfolioData?.dailyChange > 0 ? 'positive' : portfolioData?.dailyChange < 0 ? 'negative' : 'neutral'}
        icon="fas fa-chart-line"
        iconColor="bg-green-500"
      />

      <MetricCard
        title="Active Swaps"
        value={!isConnected ? '--' : portfolioData?.activeSwaps?.toString() || '0'}
        change={!isConnected ? '' : portfolioData?.pendingSwaps ? `${portfolioData.pendingSwaps} pending` : '0 pending'}
        changeType="neutral"
        icon="fas fa-exchange-alt"
        iconColor="bg-cyan-500"
      />

      <MetricCard
        title="Gas Saved"
        value={!isConnected ? '--' : portfolioData?.gasSaved ? `$${portfolioData.gasSaved.toFixed(2)}` : '$0.00'}
        change={!isConnected ? '' : "This month"}
        changeType="positive"
        icon="fas fa-fire"
        iconColor="bg-yellow-500"
      />
    </div>
  );
}
