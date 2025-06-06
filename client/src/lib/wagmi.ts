import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'NexusFlow Dashboard',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '43ef59d4bdb13441bb4f932e5c5412df',
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
  multiInjectedProviderDiscovery: false,
});