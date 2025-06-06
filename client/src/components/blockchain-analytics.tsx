import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BLOCKSCOUT_API_BASE = 'https://eth.blockscout.com/api/v2';

interface AddressAnalytics {
  totalTransactions: number;
  totalValue: string;
  firstActivity: string;
  lastActivity: string;
  contractInteractions: number;
  uniqueTokens: number;
  avgTransactionValue: string;
  gasSpent: string;
}

interface TransactionPattern {
  date: string;
  count: number;
  volume: number;
}

export function BlockchainAnalytics() {
  const { toast } = useToast();
  const [targetAddress, setTargetAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState('');
  const [analysisType, setAnalysisType] = useState<'activity' | 'patterns' | 'connections'>('activity');

  const { data: addressAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['address-analytics', activeAddress],
    queryFn: async () => {
      if (!activeAddress) return null;
      
      // Fetch comprehensive address data
      const [addressInfo, transactions, tokenTransfers] = await Promise.all([
        fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}`).then(r => r.json()),
        fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}/transactions?limit=100`).then(r => r.json()),
        fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}/token-transfers?limit=100`).then(r => r.json()),
      ]);

      // Calculate analytics
      const totalValue = transactions.items?.reduce((sum: number, tx: any) => {
        return sum + (parseInt(tx.value || '0') / Math.pow(10, 18));
      }, 0) || 0;

      const contractInteractions = transactions.items?.filter((tx: any) => 
        tx.to?.is_contract || tx.method !== 'Transfer'
      ).length || 0;

      const uniqueTokens = new Set(
        tokenTransfers.items?.map((transfer: any) => transfer.token.address) || []
      ).size;

      const gasSpent = transactions.items?.reduce((sum: number, tx: any) => {
        return sum + (parseInt(tx.gas_used || '0') * parseInt(tx.gas_price || '0') / Math.pow(10, 18));
      }, 0) || 0;

      return {
        totalTransactions: addressInfo.transactions_count || 0,
        totalValue: totalValue.toFixed(6),
        firstActivity: transactions.items?.[transactions.items.length - 1]?.timestamp || 'Unknown',
        lastActivity: transactions.items?.[0]?.timestamp || 'Unknown',
        contractInteractions,
        uniqueTokens,
        avgTransactionValue: (totalValue / (addressInfo.transactions_count || 1)).toFixed(6),
        gasSpent: gasSpent.toFixed(6),
      } as AddressAnalytics;
    },
    enabled: !!activeAddress,
  });

  const { data: transactionPatterns } = useQuery({
    queryKey: ['transaction-patterns', activeAddress],
    queryFn: async () => {
      if (!activeAddress) return null;
      
      const response = await fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}/transactions?limit=50`);
      const data = await response.json();
      
      // Group transactions by date
      const patterns: { [key: string]: { count: number; volume: number } } = {};
      
      data.items?.forEach((tx: any) => {
        const date = new Date(tx.timestamp).toISOString().split('T')[0];
        const value = parseInt(tx.value || '0') / Math.pow(10, 18);
        
        if (!patterns[date]) {
          patterns[date] = { count: 0, volume: 0 };
        }
        patterns[date].count++;
        patterns[date].volume += value;
      });

      return Object.entries(patterns)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days with activity
    },
    enabled: !!activeAddress && analysisType === 'patterns',
  });

  const handleAnalyze = () => {
    if (!targetAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive"
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddress.trim())) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid Ethereum address (42 characters starting with 0x)",
        variant: "destructive"
      });
      return;
    }

    setActiveAddress(targetAddress.trim());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <i className="fas fa-chart-bar mr-2"></i>
            Advanced Blockchain Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter address to analyze (0x...)"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              className="bg-gray-800 border-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} className="crypto-gradient">
              <i className="fas fa-search mr-2"></i>
              Analyze
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={analysisType === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisType('activity')}
            >
              Activity Analysis
            </Button>
            <Button
              variant={analysisType === 'patterns' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisType('patterns')}
            >
              Transaction Patterns
            </Button>
            <Button
              variant={analysisType === 'connections' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisType('connections')}
            >
              Network Connections
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Results */}
      {activeAddress && (
        <>
          {analysisType === 'activity' && (
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-white">Address Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                    <p className="text-gray-400">Analyzing blockchain data...</p>
                  </div>
                ) : addressAnalytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Transactions</p>
                          <p className="text-2xl font-bold text-white">{addressAnalytics.totalTransactions.toLocaleString()}</p>
                        </div>
                        <i className="fas fa-exchange-alt text-blue-500 text-xl"></i>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Value Moved</p>
                          <p className="text-2xl font-bold text-white">{addressAnalytics.totalValue} ETH</p>
                        </div>
                        <i className="fas fa-coins text-green-500 text-xl"></i>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Contract Interactions</p>
                          <p className="text-2xl font-bold text-white">{addressAnalytics.contractInteractions}</p>
                        </div>
                        <i className="fas fa-code text-purple-500 text-xl"></i>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Unique Tokens</p>
                          <p className="text-2xl font-bold text-white">{addressAnalytics.uniqueTokens}</p>
                        </div>
                        <i className="fas fa-layer-group text-cyan-500 text-xl"></i>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg col-span-2">
                      <p className="text-gray-400 text-sm">First Activity</p>
                      <p className="text-white">{formatDate(addressAnalytics.firstActivity)}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg col-span-2">
                      <p className="text-gray-400 text-sm">Gas Spent</p>
                      <p className="text-white">{addressAnalytics.gasSpent} ETH</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">Failed to load analytics data</p>
                )}
              </CardContent>
            </Card>
          )}

          {analysisType === 'patterns' && transactionPatterns && (
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-white">Transaction Patterns (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionPatterns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px' 
                        }}
                        labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      />
                      <Bar dataKey="count" fill="#3B82F6" name="Transaction Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transactionPatterns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px' 
                        }}
                        labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Volume (ETH)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisType === 'connections' && (
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="text-white">Network Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <i className="fas fa-network-wired text-4xl text-purple-500 mb-4"></i>
                  <p className="text-gray-400 mb-2">Network analysis visualization</p>
                  <p className="text-sm text-gray-500">
                    Advanced connection mapping requires additional API access.
                    Contact your administrator for enhanced analytics features.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}