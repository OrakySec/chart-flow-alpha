
import React, { useState, useEffect } from 'react';
import { Search, Trending, Banknote, Globe, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AssetCategory = 'All' | 'Crypto' | 'Stocks' | 'Forex';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  previousPrice?: number;
  change24h: number;
  category: AssetCategory;
}

interface AssetPanelProps {
  onSelectAsset: (asset: Asset) => void;
  selectedAsset?: Asset;
}

const MOCK_ASSETS: Asset[] = [
  { id: 'btc-usdt', name: 'Bitcoin', symbol: 'BTC/USDT', price: 62149.12, change24h: 2.35, category: 'Crypto' },
  { id: 'eth-usdt', name: 'Ethereum', symbol: 'ETH/USDT', price: 3052.87, change24h: -1.23, category: 'Crypto' },
  { id: 'aapl', name: 'Apple Inc', symbol: 'AAPL', price: 172.58, change24h: 0.87, category: 'Stocks' },
  { id: 'msft', name: 'Microsoft', symbol: 'MSFT', price: 402.17, change24h: 1.12, category: 'Stocks' },
  { id: 'eurusd', name: 'Euro/USD', symbol: 'EUR/USD', price: 1.0812, change24h: -0.24, category: 'Forex' },
  { id: 'gbpusd', name: 'GBP/USD', symbol: 'GBP/USD', price: 1.2651, change24h: 0.16, category: 'Forex' },
  { id: 'gold', name: 'Gold', symbol: 'XAU/USD', price: 2329.62, change24h: 0.82, category: 'Forex' },
  { id: 'sol-usdt', name: 'Solana', symbol: 'SOL/USDT', price: 139.28, change24h: 5.42, category: 'Crypto' },
];

const AssetPanel: React.FC<AssetPanelProps> = ({ onSelectAsset, selectedAsset }) => {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('All');
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  // Simulate WebSocket updates with random price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets => 
        prevAssets.map(asset => {
          const priceChange = asset.price * (Math.random() * 0.002 - 0.001);
          const newPrice = Number((asset.price + priceChange).toFixed(
            asset.category === 'Forex' ? 4 : 2
          ));
          
          return {
            ...asset,
            previousPrice: asset.price,
            price: newPrice,
          };
        })
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter assets based on search and category
  useEffect(() => {
    let filtered = assets;
    
    if (searchQuery) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeCategory !== 'All') {
      filtered = filtered.filter(asset => asset.category === activeCategory);
    }
    
    setFilteredAssets(filtered);
  }, [assets, searchQuery, activeCategory]);

  const handleAssetSelect = (asset: Asset) => {
    onSelectAsset(asset);
    toast({
      title: "Asset Selected",
      description: `Now viewing ${asset.name} (${asset.symbol})`,
    });
  };

  const categories: { value: AssetCategory, label: string, icon: React.ReactNode }[] = [
    { value: 'All', label: 'All Assets', icon: <Trending size={16} /> },
    { value: 'Crypto', label: 'Crypto', icon: <Banknote size={16} /> },
    { value: 'Stocks', label: 'Stocks', icon: <Trending size={16} /> },
    { value: 'Forex', label: 'Forex', icon: <Globe size={16} /> },
  ];

  const getPriceChangeClass = (asset: Asset) => {
    if (asset.previousPrice === undefined) return '';
    return asset.price > asset.previousPrice ? 'price-up' : asset.price < asset.previousPrice ? 'price-down' : '';
  };

  const togglePanel = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`trading-panel h-full flex flex-col transition-all duration-300 ${expanded ? 'w-full' : 'w-12'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${expanded ? 'block' : 'hidden'}`}>Assets</h2>
        <button onClick={togglePanel} className="p-1 hover:bg-panel-hover rounded-md">
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      {expanded && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="order-form-input pl-9"
            />
          </div>
          
          <div className="flex mb-4 space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap
                  ${activeCategory === category.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'}`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredAssets.length > 0 ? (
              <div className="space-y-1">
                {filteredAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className={`asset-item ${selectedAsset?.id === asset.id ? 'bg-panel-hover' : ''}`}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-medium ${getPriceChangeClass(asset)}`}>
                        {asset.category === 'Forex' ? asset.price.toFixed(4) : asset.price.toFixed(2)}
                      </span>
                      <span className={`text-xs ${asset.change24h >= 0 ? 'text-tradingChart-bullish' : 'text-tradingChart-bearish'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No assets found for "{searchQuery}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AssetPanel;
