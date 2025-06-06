import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from './constants';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.provider = provider;
      this.signer = await provider.getSigner();
      
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  async getCurrentNetwork(): Promise<number> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
        if (chain) {
          await this.addNetwork(chain);
        }
      }
      throw error;
    }
  }

  private async addNetwork(chain: any): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chain.id.toString(16)}`,
        chainName: chain.name,
        rpcUrls: [chain.rpcUrl],
        blockExplorerUrls: [chain.blockExplorer],
        nativeCurrency: chain.nativeCurrency,
      }],
    });
  }

  isConnected(): boolean {
    return !!this.provider && !!this.signer;
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }
}

// Global Web3 service instance
export const web3Service = new Web3Service();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
