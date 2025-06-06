import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAccount } from 'wagmi';
import { useTokenVault, useTokenBalance } from '@/hooks/useContracts';
import { formatEther } from 'viem';
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_TOKENS = ['WETH', 'USDC', 'USDT', 'DAI', 'UNI', 'WBTC'];

export function VaultManagement() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [selectedToken, setSelectedToken] = useState('WETH');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const {
    userPositions,
    availableRewards,
    deposit,
    withdraw,
    claimRewards,
    isPending
  } = useTokenVault();

  const { formattedBalance } = useTokenBalance(selectedToken);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive"
      });
      return;
    }

    try {
      await deposit(selectedToken, depositAmount);
      toast({
        title: "Deposit Initiated",
        description: `Depositing ${depositAmount} ${selectedToken} to vault`,
      });
      setDepositAmount('');
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    try {
      await withdraw(selectedToken, withdrawAmount);
      toast({
        title: "Withdrawal Initiated",
        description: `Withdrawing ${withdrawAmount} ${selectedToken} from vault`,
      });
      setWithdrawAmount('');
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
      toast({
        title: "Rewards Claimed",
        description: "Your vault rewards have been claimed successfully",
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="crypto-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <i className="fas fa-wallet text-4xl text-gray-500 mb-4"></i>
            <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
            <p className="text-gray-400">Connect your wallet to access vault management</p>
            <p className="text-sm text-yellow-400 mt-2">Note: Smart contracts deployed on Sepolia testnet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rewards Section */}
      {availableRewards && Number(availableRewards.toString()) > 0 && (
        <Card className="crypto-card border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <i className="fas fa-gift mr-2"></i>
              Available Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {formatEther(BigInt(availableRewards.toString()))} WETH
                </p>
                <p className="text-sm text-gray-400">Ready to claim</p>
              </div>
              <Button
                onClick={handleClaimRewards}
                disabled={isPending}
                className="crypto-gradient"
              >
                {isPending ? 'Claiming...' : 'Claim Rewards'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <i className="fas fa-university mr-2"></i>
            Token Vault Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Select Token
                  </label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem key={token} value={token}>
                          {token}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">Amount</label>
                    <span className="text-sm text-gray-400">
                      Balance: {formattedBalance} {selectedToken}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={isPending || !depositAmount}
                  className="w-full crypto-gradient"
                >
                  {isPending ? 'Depositing...' : `Deposit ${selectedToken}`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Select Token
                  </label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem key={token} value={token}>
                          {token}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={isPending || !withdrawAmount}
                  className="w-full crypto-gradient"
                >
                  {isPending ? 'Withdrawing...' : `Withdraw ${selectedToken}`}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Positions Overview */}
      {userPositions && userPositions.length > 0 && (
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <i className="fas fa-chart-pie mr-2"></i>
              Your Vault Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPositions.map((position: any, index: number) => {
                const tokenSymbol = Object.entries(SUPPORTED_TOKENS).find(
                  ([_, addr]) => addr === position.token
                )?.[0] || 'Unknown';

                return (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {tokenSymbol}
                        </Badge>
                        <span className="text-white font-medium">
                          {formatEther(BigInt(position.amount.toString()))}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Entry Price</p>
                        <p className="text-white">
                          ${formatEther(BigInt(position.entryPrice.toString()))}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-2 bg-gray-700" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Deposited: {new Date(Number(position.lastUpdate) * 1000).toLocaleDateString()}
                      </span>
                      <span className="text-green-400">
                        Yield: {formatEther(BigInt(position.accumulatedYield.toString()))} ETH
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}