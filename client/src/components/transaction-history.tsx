import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TRANSACTION_TYPES } from "@/lib/constants";

interface Transaction {
  id: string;
  hash: string;
  type: 'swap' | 'send' | 'receive';
  amount: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  gasUsed: number;
  fromToken?: string;
  toToken?: string;
}

export function TransactionHistory() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-purple-500">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="text-purple-500 hover:text-cyan-500">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Hash</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Gas</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map((tx: Transaction) => {
                  const txType = TRANSACTION_TYPES[tx.type];
                  return (
                    <tr key={tx.id} className="border-b border-gray-700">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 bg-${txType.color}/20 rounded-lg flex items-center justify-center`}>
                            <i className={`${txType.icon} text-${txType.color} text-xs`}></i>
                          </div>
                          <span className="text-white">{txType.label}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-cyan-500 hover:underline"
                        >
                          {formatHash(tx.hash)}
                        </a>
                      </td>
                      <td className="py-3 font-mono text-white">
                        {tx.type === 'swap' 
                          ? `${tx.fromToken} → ${tx.toToken}`
                          : tx.amount
                        }
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className={getStatusColor(tx.status)}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-400">
                        {formatTime(tx.timestamp)}
                      </td>
                      <td className="py-3 font-mono text-gray-400">
                        {tx.gasUsed ? `$${tx.gasUsed.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-history text-4xl text-gray-500 mb-4"></i>
            <p className="text-gray-400">No transactions found</p>
            <p className="text-sm text-gray-500">Your transaction history will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
