import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { id: 'swap', label: 'Token Swap', icon: 'fas fa-exchange-alt' },
    { id: 'tracker', label: 'Swap Tracker', icon: 'fas fa-chart-area' },
    { id: 'vault', label: 'Vault Management', icon: 'fas fa-university' },
    { id: 'merit', label: 'Merit System', icon: 'fas fa-trophy' },
    { id: 'portfolio', label: 'Portfolio', icon: 'fas fa-wallet' },
    { id: 'transactions', label: 'Transactions', icon: 'fas fa-history' },
    { id: 'explorer', label: 'Block Explorer', icon: 'fas fa-search' },
  ];

  return (
    <div className="w-64 h-full bg-gray-800 shadow-xl border-r border-gray-700 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 nexus-gradient rounded-lg flex items-center justify-center nexus-glow">
            <i className="fas fa-layer-group text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">NexusFlow</h1>
        </div>
      </div>
      
      <Separator className="mx-3 bg-gray-700" />
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-sm font-medium",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <i className={cn(item.icon, "mr-3 text-sm")}></i>
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
}
