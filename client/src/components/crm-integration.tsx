import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CRM_PROVIDERS } from "@/lib/constants";

interface CrmStatus {
  provider: string;
  isConnected: boolean;
  lastSync?: string;
}

interface BlockchainMetrics {
  currentBlock: number;
  gasPrice: number;
  tps: number;
  networkStatus: string;
}

export function CrmIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: crmStatus } = useQuery({
    queryKey: ['/api/crm/integrations'],
  });

  const { data: blockchainMetrics } = useQuery({
    queryKey: ['/api/blockchain/metrics'],
    refetchInterval: 30000,
  });

  const connectCrmMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest('POST', '/api/crm/connect', { provider });
    },
    onSuccess: (_, provider) => {
      toast({
        title: "CRM Connected",
        description: `Successfully connected to ${provider}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect CRM",
        variant: "destructive",
      });
    },
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CRM Integration Status */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <i className="fas fa-handshake mr-2 text-purple-500"></i>
            CRM Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CRM_PROVIDERS.map((provider) => {
            const status = crmStatus?.find((s: CrmStatus) => s.provider === provider.id);
            const isConnected = status?.isConnected || false;
            
            return (
              <div key={provider.id} className="flex items-center justify-between p-3 crypto-card rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${provider.color} rounded-lg flex items-center justify-center`}>
                    <i className={`${provider.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-white">{provider.name}</p>
                    <p className="text-sm text-gray-400">
                      {isConnected && status?.lastSync 
                        ? `Last sync: ${formatTime(status.lastSync)}`
                        : 'Not connected'
                      }
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-500">
                    Connected
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => connectCrmMutation.mutate(provider.id)}
                    disabled={connectCrmMutation.isPending}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {connectCrmMutation.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Blockchain Metrics */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <i className="fas fa-cubes mr-2 text-cyan-500"></i>
            Blockchain Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockchainMetrics ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Block</span>
                <span className="text-white font-mono">
                  {blockchainMetrics.currentBlock.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Price</span>
                <span className="text-white font-mono">
                  {blockchainMetrics.gasPrice} Gwei
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TPS</span>
                <span className="text-white font-mono">
                  {blockchainMetrics.tps}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Status</span>
                <Badge 
                  variant="outline" 
                  className={
                    blockchainMetrics.networkStatus === 'Healthy'
                      ? 'bg-green-500/20 border-green-500 text-green-500'
                      : 'bg-red-500/20 border-red-500 text-red-500'
                  }
                >
                  {blockchainMetrics.networkStatus}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-500 mb-2"></i>
              <p className="text-gray-400">Loading blockchain data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
