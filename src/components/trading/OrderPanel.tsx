
import React, { useState } from 'react';
import { DollarSign, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export interface Order {
  id: string;
  assetId: string;
  assetSymbol: string;
  direction: 'buy' | 'sell';
  amount: number;
  price: number;
  takeProfit?: number;
  stopLoss?: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'cancelled';
}

interface OrderPanelProps {
  selectedAsset?: {
    id: string;
    name: string;
    symbol: string;
    price: number;
  };
  onPlaceOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => void;
  accountBalance: number;
  recentOrders: Order[];
}

const OrderPanel: React.FC<OrderPanelProps> = ({ 
  selectedAsset, 
  onPlaceOrder, 
  accountBalance,
  recentOrders
}) => {
  const [amount, setAmount] = useState(100);
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [takeProfit, setTakeProfit] = useState<number | undefined>(undefined);
  const [stopLoss, setStopLoss] = useState<number | undefined>(undefined);
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  const handlePlaceOrder = () => {
    if (!selectedAsset) {
      toast({
        title: "Error",
        description: "Please select an asset first",
        variant: "destructive",
      });
      return;
    }

    // Check if there's extreme volatility (just for demonstration)
    const volatilityCheck = Math.random() > 0.8;
    
    if (volatilityCheck) {
      // Show confirmation dialog for high volatility
      if (!window.confirm(`Market for ${selectedAsset.symbol} is experiencing high volatility. Do you want to proceed?`)) {
        return;
      }
    }

    // Create the order
    const newOrder = {
      assetId: selectedAsset.id,
      assetSymbol: selectedAsset.symbol,
      direction,
      amount,
      price: selectedAsset.price,
      takeProfit,
      stopLoss,
    };

    onPlaceOrder(newOrder);
    
    toast({
      title: "Order Placed",
      description: `${direction.toUpperCase()} order for ${amount}$ of ${selectedAsset.symbol} has been executed`,
      variant: direction === 'buy' ? 'default' : 'destructive',
    });
    
    // Reset form
    setTakeProfit(undefined);
    setStopLoss(undefined);
  };

  const togglePanel = () => {
    setExpanded(!expanded);
  };

  // Calculate min/max investment amount based on asset
  const minAmount = 10;
  const maxAmount = Math.min(10000, accountBalance);

  return (
    <div className={`trading-panel h-full flex flex-col transition-all duration-300 ${expanded ? 'w-full' : 'w-12'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${expanded ? 'block' : 'hidden'}`}>Trade</h2>
        <button onClick={togglePanel} className="p-1 hover:bg-panel-hover rounded-md">
          {expanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {expanded && (
        <>
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="p-3 bg-panel-hover rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{selectedAsset.symbol}</h3>
                    <p className="text-xs text-muted-foreground">{selectedAsset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{selectedAsset.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Current Price</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={minAmount}
                      max={maxAmount}
                      className="order-form-input pl-9"
                    />
                  </div>
                  <div className="mt-2">
                    <Slider
                      value={[amount]}
                      min={minAmount}
                      max={maxAmount}
                      step={10}
                      onValueChange={(value) => setAmount(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>${minAmount}</span>
                      <span>${maxAmount}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Direction</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setDirection('buy')}
                      className={`flex-1 direction-toggle ${direction === 'buy' ? 'bg-tradingChart-bullish text-black' : 'bg-panel-hover'}`}
                    >
                      <ArrowUp size={18} />
                      <span>BUY</span>
                    </button>
                    <button
                      onClick={() => setDirection('sell')}
                      className={`flex-1 direction-toggle ${direction === 'sell' ? 'bg-tradingChart-bearish text-white' : 'bg-panel-hover'}`}
                    >
                      <ArrowDown size={18} />
                      <span>SELL</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Take Profit</label>
                    <Switch
                      checked={takeProfit !== undefined}
                      onCheckedChange={(checked) => setTakeProfit(checked ? selectedAsset.price * (direction === 'buy' ? 1.05 : 0.95) : undefined)}
                    />
                  </div>
                  
                  {takeProfit !== undefined && (
                    <div className="relative">
                      <input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(Number(e.target.value))}
                        className="order-form-input"
                        step={0.01}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Stop Loss</label>
                    <Switch
                      checked={stopLoss !== undefined}
                      onCheckedChange={(checked) => setStopLoss(checked ? selectedAsset.price * (direction === 'buy' ? 0.95 : 1.05) : undefined)}
                    />
                  </div>
                  
                  {stopLoss !== undefined && (
                    <div className="relative">
                      <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))}
                        className="order-form-input"
                        step={0.01}
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full ${direction === 'buy' ? 'bg-tradingChart-bullish hover:bg-tradingChart-bullish/90 text-black' : 'bg-tradingChart-bearish hover:bg-tradingChart-bearish/90'}`}
                  onClick={handlePlaceOrder}
                >
                  Confirm {direction === 'buy' ? 'Buy' : 'Sell'} Order
                </Button>
                
                <div className="border-t border-panel-border pt-3">
                  <p className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Balance:</span>
                    <span className="font-medium">${accountBalance.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-6">
              <p>Select an asset to start trading</p>
            </div>
          )}
          
          {recentOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-panel-border">
              <h3 className="text-sm font-medium mb-2">Recent Orders</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentOrders.map(order => (
                  <div key={order.id} className="text-xs p-2 bg-panel-hover rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium">{order.assetSymbol}</span>
                      <span className={order.direction === 'buy' ? 'text-tradingChart-bullish' : 'text-tradingChart-bearish'}>
                        {order.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>${order.amount.toFixed(2)}</span>
                      <span className="text-muted-foreground">
                        {order.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderPanel;
