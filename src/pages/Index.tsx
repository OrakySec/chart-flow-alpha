
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AssetPanel from '@/components/trading/AssetPanel';
import OrderPanel from '@/components/trading/OrderPanel';
import TradingChart from '@/components/trading/TradingChart';
import { Order } from '@/components/trading/OrderPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TradingDashboard = () => {
  const isMobile = useIsMobile();
  
  const [selectedAsset, setSelectedAsset] = useState<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [accountBalance, setAccountBalance] = useState(10000);
  
  // Collapsed state for mobile panels
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
  };

  const handlePlaceOrder = (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
    // Generate a unique ID
    const id = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create a new order
    const newOrder: Order = {
      ...orderData,
      id,
      timestamp: new Date(),
      status: 'executed',
    };
    
    // Update orders list
    setOrders(prev => [newOrder, ...prev].slice(0, 10)); // Keep only the 10 most recent orders
    
    // Update account balance
    setAccountBalance(prev => prev - orderData.amount);
  };

  const handleOrderUpdate = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  // Function to toggle panels on mobile
  const toggleLeftPanel = () => setLeftPanelOpen(prev => !prev);
  const toggleRightPanel = () => setRightPanelOpen(prev => !prev);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header - could add a header component here if needed */}
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Assets */}
        <div className={`${
          isMobile 
            ? `absolute left-0 top-0 bottom-0 z-10 transition-transform ${leftPanelOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-1/5'
        }`}>
          <AssetPanel 
            onSelectAsset={handleAssetSelect} 
            selectedAsset={selectedAsset}
          />
        </div>
        
        {/* Mobile toggle for left panel */}
        {isMobile && (
          <button 
            onClick={toggleLeftPanel}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-panel-bg border border-panel-border rounded-r-lg p-2 z-20"
          >
            {leftPanelOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
        
        {/* Center - Chart */}
        <div className={`flex-1 p-4 ${isMobile ? 'w-full' : 'w-3/5'}`}>
          <TradingChart 
            selectedAsset={selectedAsset} 
            orders={orders}
            onOrderUpdate={handleOrderUpdate}
          />
        </div>
        
        {/* Right panel - Orders */}
        <div className={`${
          isMobile 
            ? `absolute right-0 top-0 bottom-0 z-10 transition-transform ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`
            : 'w-1/5'
        }`}>
          <OrderPanel 
            selectedAsset={selectedAsset}
            onPlaceOrder={handlePlaceOrder}
            accountBalance={accountBalance}
            recentOrders={orders}
          />
        </div>
        
        {/* Mobile toggle for right panel */}
        {isMobile && (
          <button 
            onClick={toggleRightPanel}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-panel-bg border border-panel-border rounded-l-lg p-2 z-20"
          >
            {rightPanelOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard;
