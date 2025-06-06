import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const BLOCKSCOUT_API_BASE = 'https://eth.blockscout.com/api/v2';

interface AddressInfo {
  hash: string;
  coin_balance: string;
  transactions_count: number;
  token_transfers_count: number;
  is_contract: boolean;
  creation_tx_hash?: string;
}

interface Transaction {
  hash: string;
  block: number;
  timestamp: string;
  from: {
    hash: string;
    is_contract: boolean;
  };
  to: {
    hash: string;
    is_contract: boolean;
  } | null;
  value: string;
  fee: {
    value: string;
  };
  gas_used: string;
  status: string;
  method: string;
}

interface TokenTransfer {
  token: {
    symbol: string;
    name: string;
    decimals: string;
    address: string;
  };
  from: {
    hash: string;
  };
  to: {
    hash: string;
  };
  total: {
    value: string;
    decimals: string;
  };
  tx_hash: string;
  timestamp: string;
}

export function BlockscoutExplorer() {
  const { toast } = useToast();
  const [searchAddress, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: addressInfo, isLoading: addressLoading, error: addressError } = useQuery({
    queryKey: ['blockscout-address', activeAddress],
    queryFn: async () => {
      if (!activeAddress) return null;
      const response = await fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}`);
      if (!response.ok) throw new Error('Failed to fetch address info');
      return response.json();
    },
    enabled: !!activeAddress,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['blockscout-transactions', activeAddress],
    queryFn: async () => {
      if (!activeAddress) return null;
      const response = await fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!activeAddress && activeTab === 'transactions',
  });

  const { data: tokenTransfers, isLoading: tokenLoading } = useQuery({
    queryKey: ['blockscout-tokens', activeAddress],
    queryFn: async () => {
      if (!activeAddress) return null;
      const response = await fetch(`${BLOCKSCOUT_API_BASE}/addresses/${activeAddress}/token-transfers`);
      if (!response.ok) throw new Error('Failed to fetch token transfers');
      return response.json();
    },
    enabled: !!activeAddress && activeTab === 'tokens',
  });

  const handleSearch = () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive"
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(searchAddress.trim())) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid Ethereum address (42 characters starting with 0x)",
        variant: "destructive"
      });
      return;
    }

    setActiveAddress(searchAddress.trim());
    setActiveTab('overview');
  };

  const formatEther = (wei: string | number) => {
    try {
      if (!wei) return '0';
      const weiStr = typeof wei === 'string' ? wei : wei.toString();
      const eth = parseInt(weiStr) / Math.pow(10, 18);
      return eth.toFixed(6);
    } catch {
      return '0';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <i className="fas fa-search mr-2"></i>
            Blockscout Address Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Ethereum address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="bg-gray-800 border-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="crypto-gradient">
              <i className="fas fa-search mr-2"></i>
              Search
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchAddress('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')}
              className="text-xs"
            >
              UNI Token
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')}
              className="text-xs"
            >
              USDC Token
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchAddress('0x88FE2b6BC5E636b556Ffa4e943b3c9Ec4E2CcF9F')}
              className="text-xs"
            >
              Sample Address
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      {activeAddress && (
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Address Information</span>
              {addressInfo?.is_contract && (
                <Badge className="bg-purple-500">Contract</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addressLoading ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                <p className="text-gray-400 mt-2">Loading address information...</p>
              </div>
            ) : addressError ? (
              <div className="text-center py-4">
                <i className="fas fa-exclamation-triangle text-2xl text-red-400"></i>
                <p className="text-red-400 mt-2">Failed to load address information</p>
              </div>
            ) : addressInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Address</label>
                    <p className="text-white font-mono text-sm break-all">{addressInfo.hash || activeAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">ETH Balance</label>
                    <p className="text-white">{formatEther(addressInfo.coin_balance || '0')} ETH</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Transactions</label>
                    <p className="text-white">{Number(addressInfo.transactions_count || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Token Transfers</label>
                    <p className="text-white">{Number(addressInfo.token_transfers_count || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-2 border-b border-gray-700">
                  <Button
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === 'transactions' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                  >
                    Transactions
                  </Button>
                  <Button
                    variant={activeTab === 'tokens' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tokens')}
                  >
                    Token Transfers
                  </Button>
                </div>

                {/* Tab Content */}
                {activeTab === 'transactions' && (
                  <div className="space-y-2">
                    {txLoading ? (
                      <p className="text-gray-400 text-center py-4">Loading transactions...</p>
                    ) : transactions?.items?.length ? (
                      transactions.items.slice(0, 10).map((tx: Transaction) => (
                        <div key={tx.hash} className="p-3 bg-gray-800 rounded border-l-4 border-blue-500">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-blue-400 font-mono text-sm">{formatAddress(tx.hash)}</span>
                            <Badge variant={tx.status === 'ok' ? 'default' : 'destructive'}>
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">From: </span>
                              <span className="text-white font-mono">{formatAddress(tx.from.hash)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">To: </span>
                              <span className="text-white font-mono">
                                {tx.to ? formatAddress(tx.to.hash) : 'Contract Creation'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Value: </span>
                              <span className="text-white">{formatEther(tx.value)} ETH</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Method: </span>
                              <span className="text-white">{tx.method || 'Transfer'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No transactions found</p>
                    )}
                  </div>
                )}

                {activeTab === 'tokens' && (
                  <div className="space-y-2">
                    {tokenLoading ? (
                      <p className="text-gray-400 text-center py-4">Loading token transfers...</p>
                    ) : tokenTransfers?.items?.length ? (
                      tokenTransfers.items.slice(0, 10).map((transfer: TokenTransfer, index: number) => (
                        <div key={`${transfer.tx_hash}-${index}`} className="p-3 bg-gray-800 rounded border-l-4 border-green-500">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-green-400 font-semibold">{transfer.token.symbol}</span>
                            <span className="text-white">
                              {(parseInt(transfer.total.value) / Math.pow(10, parseInt(transfer.total.decimals))).toFixed(4)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">From: </span>
                              <span className="text-white font-mono">{formatAddress(transfer.from.hash)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">To: </span>
                              <span className="text-white font-mono">{formatAddress(transfer.to.hash)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No token transfers found</p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {!activeAddress && (
        <Card className="crypto-card">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <i className="fas fa-search text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-lg font-semibold text-white mb-2">Explore Blockchain Data</h3>
              <p className="text-gray-400">Enter an Ethereum address to view transactions, balances, and token transfers</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}