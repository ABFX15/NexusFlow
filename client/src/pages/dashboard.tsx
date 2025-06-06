import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { TokenSwap } from "@/components/token-swap";
import { PriceChart } from "@/components/price-chart";
import { Holdings } from "@/components/holdings";
import { TransactionHistory } from "@/components/transaction-history";
import { VaultManagement } from "@/components/vault-management";
import { NetworkInfo } from "@/components/network-info";
import { BlockscoutExplorer } from "@/components/blockscout-explorer";
import { MeritDashboard } from "@/components/merit-dashboard";
import { TradingInterface } from "@/components/trading-interface";
import { SwapTracker } from "@/components/swap-tracker";


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <PortfolioOverview />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1">
                <TokenSwap />
              </div>
              <div className="xl:col-span-2 space-y-6">
                <PriceChart />
                <Holdings />
              </div>
            </div>
            <TransactionHistory />
          </div>
        );
      case 'swap':
        return <TradingInterface />;
      case 'tracker':
        return <SwapTracker />;
      case 'vault':
        return <VaultManagement />;
      case 'portfolio':
        return (
          <div className="space-y-6">
            <PortfolioOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceChart />
              <Holdings />
            </div>
          </div>
        );
      case 'merit':
        return <MeritDashboard />;
        
      case 'transactions':
        return <TransactionHistory />;

      case 'explorer':
        return <BlockscoutExplorer />;
      default:
        return (
          <div className="text-center py-12">
            <i className="fas fa-cube text-6xl text-gray-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-white mb-2">Web3 Dashboard</h2>
            <p className="text-gray-400">Select a section from the sidebar to get started</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
