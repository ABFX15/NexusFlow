import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const supportedChains = [
  {
    ...sepolia,
    icon: '🧪',
    description: 'Sepolia Testnet - Your smart contracts are deployed here',
    isTestnet: true,
    contractsDeployed: true,
  },
  {
    ...mainnet,
    icon: '🔷',
    description: 'Ethereum Mainnet - Production network',
    isTestnet: false,
    contractsDeployed: false,
  },
  {
    ...polygon,
    icon: '🟣',
    description: 'Polygon - Layer 2 scaling solution',
    isTestnet: false,
    contractsDeployed: false,
  },
  {
    ...optimism,
    icon: '🔴',
    description: 'Optimism - Optimistic rollup',
    isTestnet: false,
    contractsDeployed: false,
  },
  {
    ...arbitrum,
    icon: '🔵',
    description: 'Arbitrum - Arbitrum rollup',
    isTestnet: false,
    contractsDeployed: false,
  },
  {
    ...base,
    icon: '🛡️',
    description: 'Base - Coinbase Layer 2',
    isTestnet: false,
    contractsDeployed: false,
  },
];

export function NetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const { toast } = useToast();
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  const currentChain = supportedChains.find(chain => chain.id === chainId);

  const handleNetworkSwitch = async (targetChainId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setSwitchingTo(targetChainId);

    try {
      await switchChain({ chainId: targetChainId });
      
      const targetChain = supportedChains.find(chain => chain.id === targetChainId);
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${targetChain?.name}`,
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast({
        title: "Network Switch Failed",
        description: "Please try switching networks manually in your wallet",
        variant: "destructive"
      });
    } finally {
      setSwitchingTo(null);
    }
  };

  const getChainStatus = (chain: typeof supportedChains[0]) => {
    if (chain.id === chainId) return 'connected';
    if (chain.contractsDeployed) return 'contracts';
    if (chain.isTestnet) return 'testnet';
    return 'available';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">Connected</Badge>;
      case 'contracts':
        return <Badge className="bg-blue-500 text-white">Smart Contracts</Badge>;
      case 'testnet':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Testnet</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <i className="fas fa-network-wired mr-2"></i>
          Network Selection
        </CardTitle>
        {currentChain && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currentChain.icon}</span>
            <div>
              <p className="text-white font-medium">{currentChain.name}</p>
              <p className="text-sm text-gray-400">{currentChain.description}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!isConnected && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <i className="fas fa-info-circle mr-2"></i>
              Connect your wallet to switch networks
            </p>
          </div>
        )}

        <div className="space-y-2">
          {supportedChains.map((chain) => {
            const status = getChainStatus(chain);
            const isCurrentChain = chain.id === chainId;
            const isSwitching = switchingTo === chain.id;

            return (
              <div
                key={chain.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrentChain
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{chain.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium">{chain.name}</p>
                        {getStatusBadge(status)}
                        {chain.contractsDeployed && (
                          <Badge className="bg-purple-500 text-white text-xs">
                            <i className="fas fa-code mr-1"></i>
                            Contracts Deployed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{chain.description}</p>
                      {chain.id === sepolia.id && (
                        <p className="text-xs text-blue-400 mt-1">
                          SwapTracker: 0x0C31...52AF | TokenVault: 0x6A6C...232e
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isCurrentChain ? (
                      <Button variant="outline" size="sm" disabled>
                        <i className="fas fa-check mr-2"></i>
                        Current
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className={chain.contractsDeployed ? "crypto-gradient" : ""}
                        variant={chain.contractsDeployed ? "default" : "outline"}
                        onClick={() => handleNetworkSwitch(chain.id)}
                        disabled={!isConnected || isPending || isSwitching}
                      >
                        {isSwitching ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Switching...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-exchange-alt mr-2"></i>
                            Switch
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {chainId === sepolia.id && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">
              <i className="fas fa-check-circle mr-2"></i>
              Connected to Sepolia testnet where your smart contracts are deployed. 
              All NexusFlow features including merit system and vault management are available.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            <i className="fas fa-info mr-1"></i>
            Your smart contracts (SwapTracker & TokenVault) are deployed on Sepolia testnet. 
            Switch to Sepolia for full functionality including merit tracking and vault operations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}