import { 
  users, 
  wallets, 
  tokens, 
  portfolios, 
  transactions, 
  crmIntegrations,
  type User, 
  type InsertUser,
  type Wallet,
  type InsertWallet,
  type Token,
  type InsertToken,
  type Portfolio,
  type InsertPortfolio,
  type Transaction,
  type InsertTransaction,
  type CrmIntegration,
  type InsertCrmIntegration
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet operations
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletConnection(address: string, isConnected: boolean): Promise<void>;
  
  // Token operations
  getAllTokens(): Promise<Token[]>;
  getTokenBySymbol(symbol: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  
  // Portfolio operations
  getPortfolioByWalletId(walletId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<Portfolio>): Promise<void>;
  
  // Transaction operations
  getTransactionsByWalletId(walletId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(hash: string, status: string): Promise<void>;
  
  // CRM operations
  getCrmIntegrationsByUserId(userId: number): Promise<CrmIntegration[]>;
  createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration>;
  updateCrmIntegration(id: number, integration: Partial<CrmIntegration>): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private tokens: Map<number, Token>;
  private portfolios: Map<number, Portfolio>;
  private transactions: Map<number, Transaction>;
  private crmIntegrations: Map<number, CrmIntegration>;
  private currentUserId: number;
  private currentWalletId: number;
  private currentTokenId: number;
  private currentPortfolioId: number;
  private currentTransactionId: number;
  private currentCrmId: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.tokens = new Map();
    this.portfolios = new Map();
    this.transactions = new Map();
    this.crmIntegrations = new Map();
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentTokenId = 1;
    this.currentPortfolioId = 1;
    this.currentTransactionId = 1;
    this.currentCrmId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default tokens
    const defaultTokens = [
      { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, logoUrl: null },
      { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6417c62f6C3D2B4F95f8a89E75Aa1b1', decimals: 6, logoUrl: null },
      { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logoUrl: null },
      { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, logoUrl: null },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, logoUrl: null },
    ];

    defaultTokens.forEach(token => {
      const id = this.currentTokenId++;
      this.tokens.set(id, { ...token, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Wallet operations
  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(wallet => wallet.userId === userId);
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(wallet => wallet.address === address);
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.currentWalletId++;
    const wallet: Wallet = { 
      ...insertWallet, 
      id,
      userId: insertWallet.userId || null,
      isConnected: insertWallet.isConnected || null,
      createdAt: new Date()
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWalletConnection(address: string, isConnected: boolean): Promise<void> {
    const wallet = await this.getWalletByAddress(address);
    if (wallet) {
      wallet.isConnected = isConnected;
      this.wallets.set(wallet.id, wallet);
    }
  }

  // Token operations
  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getTokenBySymbol(symbol: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(token => token.symbol === symbol);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const token: Token = { 
      ...insertToken, 
      id,
      logoUrl: insertToken.logoUrl || null
    };
    this.tokens.set(id, token);
    return token;
  }

  // Portfolio operations
  async getPortfolioByWalletId(walletId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(portfolio => portfolio.walletId === walletId);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = { 
      ...insertPortfolio, 
      id,
      walletId: insertPortfolio.walletId || null,
      tokenId: insertPortfolio.tokenId || null,
      valueUsd: insertPortfolio.valueUsd || null,
      updatedAt: new Date()
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<void> {
    const portfolio = this.portfolios.get(id);
    if (portfolio) {
      const updatedPortfolio = { ...portfolio, ...updates, updatedAt: new Date() };
      this.portfolios.set(id, updatedPortfolio);
    }
  }

  // Transaction operations
  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.walletId === walletId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      walletId: insertTransaction.walletId || null,
      fromToken: insertTransaction.fromToken || null,
      toToken: insertTransaction.toToken || null,
      amount: insertTransaction.amount || null,
      valueUsd: insertTransaction.valueUsd || null,
      gasUsed: insertTransaction.gasUsed || null,
      timestamp: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(hash: string, status: string): Promise<void> {
    const transaction = Array.from(this.transactions.values()).find(tx => tx.hash === hash);
    if (transaction) {
      transaction.status = status;
      this.transactions.set(transaction.id, transaction);
    }
  }

  // CRM operations
  async getCrmIntegrationsByUserId(userId: number): Promise<CrmIntegration[]> {
    return Array.from(this.crmIntegrations.values()).filter(integration => integration.userId === userId);
  }

  async createCrmIntegration(insertIntegration: InsertCrmIntegration): Promise<CrmIntegration> {
    const id = this.currentCrmId++;
    const integration: CrmIntegration = { 
      ...insertIntegration, 
      id,
      userId: insertIntegration.userId || null,
      isConnected: insertIntegration.isConnected || null,
      apiKey: insertIntegration.apiKey || null,
      lastSync: null
    };
    this.crmIntegrations.set(id, integration);
    return integration;
  }

  async updateCrmIntegration(id: number, updates: Partial<CrmIntegration>): Promise<void> {
    const integration = this.crmIntegrations.get(id);
    if (integration) {
      const updatedIntegration = { ...integration, ...updates };
      this.crmIntegrations.set(id, updatedIntegration);
    }
  }
}

export const storage = new MemStorage();
