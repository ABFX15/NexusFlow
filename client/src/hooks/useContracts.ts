import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, SWAP_TRACKER_ABI, TOKEN_VAULT_ABI, ERC20_ABI, TOKEN_ADDRESSES } from '@/lib/contracts';

export function useSwapTracker() {
  const { address } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();

  const { data: userSwaps } = useReadContract({
    address: CONTRACT_ADDRESSES.SWAP_TRACKER as `0x${string}`,
    abi: SWAP_TRACKER_ABI,
    functionName: 'getUserSwaps',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: totalSwaps } = useReadContract({
    address: CONTRACT_ADDRESSES.SWAP_TRACKER as `0x${string}`,
    abi: SWAP_TRACKER_ABI,
    functionName: 'getTotalSwaps',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const recordSwap = async (
    fromToken: string,
    toToken: string,
    fromAmount: string,
    toAmount: string,
    success: boolean
  ) => {
    if (!address) throw new Error('Wallet not connected');

    return writeContract({
      address: CONTRACT_ADDRESSES.SWAP_TRACKER as `0x${string}`,
      abi: SWAP_TRACKER_ABI,
      functionName: 'recordSwap',
      args: [
        fromToken as `0x${string}`,
        toToken as `0x${string}`,
        parseEther(fromAmount),
        parseEther(toAmount),
        success
      ]
    });
  };

  const getTotalSwaps = async (userAddress: string) => {
    return totalSwaps || BigInt(0);
  };

  const getUserSwaps = async (userAddress: string) => {
    return userSwaps || [];
  };

  return {
    userSwaps,
    totalSwaps,
    recordSwap,
    getTotalSwaps,
    getUserSwaps,
    isPending,
    hash
  };
}

export function useTokenVault() {
  const { address } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();

  const { data: userPositions } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
    abi: TOKEN_VAULT_ABI,
    functionName: 'getUserPositions',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: availableRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
    abi: TOKEN_VAULT_ABI,
    functionName: 'calculateRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: userStats } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
    abi: TOKEN_VAULT_ABI,
    functionName: 'userStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const deposit = async (tokenSymbol: string, amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
    if (!tokenAddress) throw new Error('Unsupported token');

    // First approve the token vault to spend tokens
    await writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`, parseEther(amount)]
    });

    // Then deposit to vault
    return writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
      abi: TOKEN_VAULT_ABI,
      functionName: 'deposit',
      args: [tokenAddress as `0x${string}`, parseEther(amount)]
    });
  };

  const withdraw = async (tokenSymbol: string, amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
    if (!tokenAddress) throw new Error('Unsupported token');

    return writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
      abi: TOKEN_VAULT_ABI,
      functionName: 'withdraw',
      args: [tokenAddress as `0x${string}`, parseEther(amount)]
    });
  };

  const claimRewards = async () => {
    if (!address) throw new Error('Wallet not connected');

    return writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
      abi: TOKEN_VAULT_ABI,
      functionName: 'claimRewards'
    });
  };

  const getYieldForToken = (tokenSymbol: string) => {
    if (!address) return null;

    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
    if (!tokenAddress) return null;

    const { data: yieldAmount } = useReadContract({
      address: CONTRACT_ADDRESSES.TOKEN_VAULT as `0x${string}`,
      abi: TOKEN_VAULT_ABI,
      functionName: 'calculateYield',
      args: [address, tokenAddress as `0x${string}`],
      query: { enabled: !!address }
    });

    return yieldAmount;
  };

  const calculateRewards = async (userAddress: string) => {
    return availableRewards || BigInt(0);
  };

  return {
    userPositions,
    availableRewards,
    userStats,
    deposit,
    withdraw,
    claimRewards,
    calculateRewards,
    getYieldForToken,
    isPending,
    hash
  };
}

export function useTokenBalance(tokenSymbol: string) {
  const { address } = useAccount();
  
  const tokenAddress = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
  
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenAddress }
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!tokenAddress }
  });

  const formattedBalance = balance && decimals 
    ? formatUnits(balance as bigint, decimals as number)
    : '0';

  return {
    balance,
    formattedBalance,
    decimals
  };
}