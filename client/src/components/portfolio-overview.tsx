import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from 'wagmi';
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
    <Card className="crypto-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            <p className={`text-sm font-medium ${changeColor}`}>{change}</p>
          </div>
          <div className={`w-12 h-12 ${iconColor} bg-opacity-20 rounded-lg flex items-center justify-center`}>
            <i className={`${icon} ${iconColor.replace('bg-', 'text-')}`}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioOverview() {
  const { address, isConnected } = useAccount();
  
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio/overview', address],
    queryFn: () => apiRequest('POST', '/api/portfolio/overview', { walletAddress: address }),
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
        value={(portfolioData as any)?.totalValue ? `$${(portfolioData as any).totalValue.toLocaleString()}` : isConnected ? '$0.00' : 'Connect Wallet'}
        change={(portfolioData as any)?.dailyChange ? `${(portfolioData as any).dailyChange > 0 ? '+' : ''}${(portfolioData as any).dailyChange.toFixed(2)}% (24h)` : isConnected ? '0% (24h)' : ''}
        changeType={(portfolioData as any)?.dailyChange > 0 ? 'positive' : (portfolioData as any)?.dailyChange < 0 ? 'negative' : 'neutral'}
        icon="fas fa-chart-line"
        iconColor="bg-green-500"
      />

      <MetricCard
        title="Active Swaps"
        value={(portfolioData as any)?.activeSwaps?.toString() || (isConnected ? '0' : '--')}
        change={(portfolioData as any)?.pendingSwaps ? `${(portfolioData as any).pendingSwaps} pending` : isConnected ? '0 pending' : ''}
        changeType="neutral"
        icon="fas fa-exchange-alt"
        iconColor="bg-cyan-500"
      />

      <MetricCard
        title="Gas Saved"
        value={(portfolioData as any)?.gasSaved ? `$${(portfolioData as any).gasSaved.toFixed(2)}` : isConnected ? '$0.00' : '--'}
        change={isConnected ? "This month" : ''}
        changeType="positive"
        icon="fas fa-fire"
        iconColor="bg-yellow-500"
      />
    </div>
  );
}
