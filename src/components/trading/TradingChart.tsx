
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import TimeframeSelector, { Timeframe } from './TimeframeSelector';
import { Order } from './OrderPanel';
import { useToast } from '@/hooks/use-toast';

interface TradingChartProps {
  selectedAsset?: {
    id: string;
    name: string;
    symbol: string;
    price: number;
  };
  orders: Order[];
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
}

// Mock candlestick data generator
const generateMockCandles = (
  basePrice: number, 
  count: number, 
  timeframe: Timeframe
) => {
  const volatility = basePrice * 0.02; // 2% volatility
  const candles = [];
  let lastClose = basePrice;
  
  // Current time
  const now = new Date();
  
  // Calculate time increment based on timeframe
  const getTimeIncrement = (tf: Timeframe) => {
    switch(tf) {
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
    }
  };
  
  const timeIncrement = getTimeIncrement(timeframe);
  
  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * timeIncrement));
    const open = lastClose;
    const high = open + (Math.random() * volatility);
    const low = open - (Math.random() * volatility);
    const close = (open + high + low) / 3 + (Math.random() * volatility - volatility/2);
    
    candles.push({
      timestamp,
      open,
      high,
      low,
      close
    });
    
    lastClose = close;
  }
  
  return candles;
};

const TradingChart: React.FC<TradingChartProps> = ({ 
  selectedAsset, 
  orders,
  onOrderUpdate
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [loading, setLoading] = useState(false);
  const [candleData, setCandleData] = useState<any[]>([]);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const { toast } = useToast();

  // Simulate chart loading when asset or timeframe changes
  useEffect(() => {
    if (!selectedAsset) return;
    
    setLoading(true);
    
    // Simulate API/WebSocket delay
    const timer = setTimeout(() => {
      const newCandleData = generateMockCandles(selectedAsset.price, 100, timeframe);
      setCandleData(newCandleData);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [selectedAsset, timeframe]);
  
  // Update chart dimensions on resize
  useEffect(() => {
    if (!chartRef.current) return;
    
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartDimensions({
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight
        });
      }
    };
    
    // Initial measurement
    updateDimensions();
    
    // Listen for resize events
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [chartRef.current]);
  
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    toast({
      description: `Timeframe changed to ${newTimeframe}`,
    });
  };

  // This function would be used with a real charting library
  // to place markers on the chart for orders
  const renderOrderMarkers = () => {
    // In a real implementation, we would convert order price to y-coordinate
    // and timestamp to x-coordinate on the chart
    
    // For the mock version, we'll just place markers randomly on the chart area
    return orders.map(order => {
      const randomX = Math.random() * (chartDimensions.width - 60) + 30;
      const randomY = Math.random() * (chartDimensions.height - 120) + 60;
      
      return (
        <div 
          key={order.id}
          className={`order-marker ${order.direction}`}
          style={{
            left: `${randomX}px`,
            top: `${randomY}px`,
          }}
          title={`${order.direction.toUpperCase()} ${order.assetSymbol} $${order.amount}`}
        >
          {order.direction === 'buy' ? '↑' : '↓'}
        </div>
      );
    });
  };
  
  // In a real app, we would use a proper charting library here
  // like TradingView's Charting Library or Lightweight Charts
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {selectedAsset && (
            <h2 className="text-lg font-semibold mr-4">
              {selectedAsset.name} ({selectedAsset.symbol})
            </h2>
          )}
          <TimeframeSelector 
            activeTimeframe={timeframe} 
            onTimeframeChange={handleTimeframeChange} 
          />
        </div>
        
        {/* This would be toolbar with chart tools in a real implementation */}
        <div className="flex space-x-2">
          {/* Placeholder for chart tools */}
        </div>
      </div>
      
      <div 
        ref={chartRef} 
        className="chart-container flex-1 relative"
        style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0, 40, 83, 0.1) 0%, rgba(0, 40, 83, 0) 90%)',
        }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : selectedAsset ? (
          <>
            {/* In a real implementation, we would render the chart here */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              {/* This is just a placeholder for the chart */}
              <div className="text-center">
                <p>TradingView Chart would be integrated here</p>
                <p className="text-xs mt-2">Currently showing: {selectedAsset.symbol} {timeframe}</p>
              </div>
            </div>
            
            {/* Render order markers */}
            {renderOrderMarkers()}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p>Select an asset to view chart</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingChart;
