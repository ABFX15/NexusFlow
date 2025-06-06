import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from 'wagmi';
import { useSwapTracker, useTokenVault } from "@/hooks/useContracts";
import { formatEther } from 'viem';

interface UserMeritData {
  totalSwaps: number;
  tradingStreak: number;
  totalVolume: string;
  accumulatedRewards: string;
  availableRewards: string;
  meritLevel: string;
  nextLevelProgress: number;
}

const MERIT_LEVELS = [
  { name: "Novice", minSwaps: 0, color: "bg-gray-400", icon: "🌱" },
  { name: "Trader", minSwaps: 5, color: "bg-blue-400", icon: "📈" },
  { name: "Expert", minSwaps: 25, color: "bg-purple-400", icon: "⭐" },
  { name: "Master", minSwaps: 100, color: "bg-yellow-400", icon: "👑" },
  { name: "Legend", minSwaps: 500, color: "bg-pink-400", icon: "🚀" },
];

export function MeritSystem() {
  const { address, isConnected } = useAccount();
  const [animatedRewards, setAnimatedRewards] = useState(0);
  const { getTotalSwaps, getUserSwaps } = useSwapTracker();
  const { calculateRewards, claimRewards, userStats } = useTokenVault();

  const { data: meritData, isLoading } = useQuery({
    queryKey: ['merit-data', address],
    queryFn: async (): Promise<UserMeritData> => {
      if (!address || !isConnected) throw new Error('Wallet not connected');
      
      // Get data from smart contracts
      const totalSwaps = await getTotalSwaps(address);
      const userSwapsData = await getUserSwaps(address);
      const stats = await userStats(address);
      const availableRewards = await calculateRewards(address);
      
      // Calculate merit level
      const currentLevel = MERIT_LEVELS.reduce((level, next) => 
        Number(totalSwaps) >= next.minSwaps ? next : level
      );
      
      const nextLevel = MERIT_LEVELS.find(level => 
        Number(totalSwaps) < level.minSwaps
      );
      
      const nextLevelProgress = nextLevel 
        ? (Number(totalSwaps) / nextLevel.minSwaps) * 100 
        : 100;

      return {
        totalSwaps: Number(totalSwaps),
        tradingStreak: Number(stats.tradingStreak),
        totalVolume: formatEther(stats.totalVolume),
        accumulatedRewards: formatEther(stats.accumulatedRewards),
        availableRewards: formatEther(availableRewards),
        meritLevel: currentLevel.name,
        nextLevelProgress: Math.min(nextLevelProgress, 100)
      };
    },
    enabled: !!address && isConnected,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Animate rewards counter
  useEffect(() => {
    if (meritData?.availableRewards) {
      const target = parseFloat(meritData.availableRewards);
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedRewards(target);
          clearInterval(timer);
        } else {
          setAnimatedRewards(current);
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [meritData?.availableRewards]);

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
    } catch (error) {
      console.error('Failed to claim rewards:', error);
    }
  };

  const getCurrentLevel = () => {
    if (!meritData) return MERIT_LEVELS[0];
    return MERIT_LEVELS.find(level => level.name === meritData.meritLevel) || MERIT_LEVELS[0];
  };

  const getNextLevel = () => {
    const currentIndex = MERIT_LEVELS.findIndex(level => level.name === meritData?.meritLevel);
    return MERIT_LEVELS[currentIndex + 1];
  };

  if (!isConnected) {
    return (
      <Card className="nexus-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="nexus-glow text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
            <p className="text-gray-400">Connect your wallet to view your merit status and rewards</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="nexus-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="nexus-spinner text-4xl mb-4">⚡</div>
            <p className="text-gray-400">Loading merit data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="space-y-6">
      {/* Merit Status Overview */}
      <Card className="nexus-card overflow-hidden">
        <div className="nexus-bg absolute inset-0 opacity-10" />
        <CardHeader className="relative">
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <span className="text-2xl mr-3">{currentLevel.icon}</span>
              Merit Status
            </span>
            <Badge className={`${currentLevel.color} text-white nexus-pulse`}>
              {meritData?.meritLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Level Progress</span>
              <span className="text-white">
                {nextLevel ? `${meritData?.totalSwaps}/${nextLevel.minSwaps} swaps` : 'Max Level'}
              </span>
            </div>
            <Progress 
              value={meritData?.nextLevelProgress || 0} 
              className="nexus-progress"
            />
            {nextLevel && (
              <p className="text-xs text-gray-400">
                Next: {nextLevel.icon} {nextLevel.name}
              </p>
            )}
          </div>

          {/* Merit Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">📊</div>
              <div className="text-xl font-bold text-white nexus-counter">
                {meritData?.totalSwaps || 0}
              </div>
              <div className="text-sm text-gray-400">Total Swaps</div>
            </div>
            
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">🔥</div>
              <div className="text-xl font-bold text-white nexus-counter">
                {meritData?.tradingStreak || 0}
              </div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">💰</div>
              <div className="text-xl font-bold text-white nexus-counter">
                {parseFloat(meritData?.totalVolume || '0').toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Total Volume (ETH)</div>
            </div>
            
            <div className="nexus-stat-card">
              <div className="text-2xl nexus-glow">🎁</div>
              <div className="text-xl font-bold text-white nexus-counter">
                {parseFloat(meritData?.accumulatedRewards || '0').toFixed(4)}
              </div>
              <div className="text-sm text-gray-400">Total Rewards (ETH)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <Card className="nexus-card">
        <div className="nexus-bg absolute inset-0 opacity-10" />
        <CardHeader className="relative">
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-3 nexus-glow">⚡</span>
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center space-y-4">
            <div className="nexus-reward-display">
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text nexus-glow">
                {animatedRewards.toFixed(6)}
              </div>
              <div className="text-lg text-gray-400">ETH Available</div>
            </div>
            
            <Button 
              onClick={handleClaimRewards}
              disabled={!meritData?.availableRewards || parseFloat(meritData.availableRewards) === 0}
              className="nexus-button w-full"
            >
              <span className="mr-2">🎯</span>
              Claim Rewards
            </Button>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Rewards are calculated based on trading volume and streak bonuses</p>
              <p>Minimum 1000 ETH volume required • Daily reward claims available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merit Levels Guide */}
      <Card className="nexus-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-3">🏆</span>
            Merit Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MERIT_LEVELS.map((level, index) => (
              <div 
                key={level.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  level.name === meritData?.meritLevel 
                    ? 'border-purple-500 bg-purple-500/10 nexus-glow' 
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{level.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{level.name}</div>
                    <div className="text-sm text-gray-400">{level.minSwaps}+ swaps required</div>
                  </div>
                </div>
                {level.name === meritData?.meritLevel && (
                  <Badge className="nexus-pulse bg-purple-500">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}