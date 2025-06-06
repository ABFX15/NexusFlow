import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useChainId } from 'wagmi';

export function NetworkInfo() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  if (!isConnected) {
    return null;
  }

  const isMainnet = chainId === 1;
  const chainName = isMainnet ? 'Ethereum Mainnet' : `Chain ${chainId}`;
  const contractNetwork = 'Sepolia Testnet';

  return (
    <Card className="crypto-card border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center">
          <i className="fas fa-network-wired mr-2"></i>
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Connected Network:</span>
          <Badge variant={isMainnet ? "default" : "secondary"}>
            {chainName}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Chain ID:</span>
          <span className="text-white">{chainId}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Smart Contracts:</span>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            {contractNetwork}
          </Badge>
        </div>

        {isMainnet && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              <i className="fas fa-info-circle mr-2"></i>
              Smart contracts are deployed on Sepolia testnet. 
              Switch to Sepolia to interact with vault contracts.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">SwapTracker:</span>
            <span className="text-gray-300 font-mono">0x0C31...52AF</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">TokenVault:</span>
            <span className="text-gray-300 font-mono">0x6A6C...232e</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}