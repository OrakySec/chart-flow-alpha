
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import TimeframeSelector, { Timeframe } from './TimeframeSelector';
import { Order } from './OrderPanel';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Rectangle,
  Area,
} from 'recharts';

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
      close,
      color: close > open ? '#00FF7F' : '#FF4136'
    });
    
    lastClose = close;
  }
  
  return candles;
};

// Custom Candlestick Component
const CustomCandlestick = (props: any) => {
  const { x, y, width, height, open, close, low, high, fill } = props;
  
  // Determine if candle is bullish (green) or bearish (red)
  const isGreen = close > open;
  const color = isGreen ? '#00FF7F' : '#FF4136';
  
  // Calculate positions
  const openY = y + height * (1 - (open - low) / (high - low));
  const closeY = y + height * (1 - (close - low) / (high - low));
  const bodyY = Math.min(openY, closeY);
  const bodyHeight = Math.abs(closeY - openY);
  
  return (
    <g>
      {/* Wick - the full vertical line */}
      <line 
        x1={x + width / 2} 
        y1={y} 
        x2={x + width / 2} 
        y2={y + height}
        stroke={color} 
        strokeWidth={1}
      />
      
      {/* Body - the rectangle */}
      <rect 
        x={x} 
        y={bodyY} 
        width={width} 
        height={Math.max(1, bodyHeight)} // Ensure minimum height of 1px
        fill={color}
      />
    </g>
  );
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGreen = data.close > data.open;
    
    return (
      <div className="bg-[#1E2230] p-2 border border-[#2A2E39] rounded-md shadow-md">
        <p className="text-xs text-white mb-1">
          {new Date(data.timestamp).toLocaleTimeString()}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="text-muted-foreground">Open:</span>
          <span className="text-white font-mono">{data.open.toFixed(2)}</span>
          
          <span className="text-muted-foreground">High:</span>
          <span className="text-white font-mono">{data.high.toFixed(2)}</span>
          
          <span className="text-muted-foreground">Low:</span>
          <span className="text-white font-mono">{data.low.toFixed(2)}</span>
          
          <span className="text-muted-foreground">Close:</span>
          <span className={`font-mono ${isGreen ? 'text-[#00FF7F]' : 'text-[#FF4136]'}`}>
            {data.close.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }
  
  return null;
};

const TradingChart: React.FC<TradingChartProps> = ({
  selectedAsset,
  orders,
  onOrderUpdate
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [loading, setLoading] = useState(false);
  const [candleData, setCandleData] = useState<any[]>([]);
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Simulate chart loading when asset or timeframe changes
  useEffect(() => {
    if (!selectedAsset) return;
    
    setLoading(true);
    
    // Simulate API/WebSocket delay
    const timer = setTimeout(() => {
      const newCandleData = generateMockCandles(selectedAsset.price, 100, timeframe);
      setCandleData(newCandleData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [selectedAsset, timeframe]);

  const formatXAxis = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatYAxis = (value: number) => {
    return value.toFixed(2);
  };

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    toast({
      description: `Timeframe changed to ${newTimeframe}`,
    });
  };

  // Find domain for Y axis to properly show all data plus some margin
  const getYAxisDomain = () => {
    if (!candleData || candleData.length === 0) return [0, 0];
    
    const allValues = candleData.reduce((acc, candle) => {
      acc.push(candle.high, candle.low);
      return acc;
    }, []);
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    
    return [min - padding, max + padding];
  };

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
      </div>

      <div 
        ref={chartContainerRef}
        className="flex-1 relative bg-[#12131A] rounded-lg border border-panel-border overflow-hidden" 
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : selectedAsset ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={candleData}
              margin={{ top: 20, right: 60, left: 0, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#1E2230" 
                vertical={true} 
                horizontal={true} 
              />
              
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis} 
                tick={{ fill: '#8F9CAF' }}
                stroke="#2A2E39"
                tickLine={{ stroke: '#2A2E39' }}
                axisLine={{ stroke: '#2A2E39' }}
                minTickGap={30}
              />
              
              <YAxis 
                domain={getYAxisDomain()}
                tickFormatter={formatYAxis} 
                orientation="right" 
                tick={{ fill: '#8F9CAF' }}
                stroke="#2A2E39"
                tickLine={{ stroke: '#2A2E39' }}
                axisLine={{ stroke: '#2A2E39' }}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#3F4251', strokeDasharray: '3 3' }}
              />
              
              {/* Reference lines for orders */}
              {orders.map((order) => (
                <ReferenceLine
                  key={order.id}
                  y={order.price}
                  stroke={order.direction === 'buy' ? '#00FF7F' : '#FF4136'}
                  strokeDasharray="3 3"
                  label={{
                    value: `${order.direction.toUpperCase()} @ ${order.price.toFixed(2)}`,
                    fill: order.direction === 'buy' ? '#00FF7F' : '#FF4136',
                    position: 'insideBottomRight'
                  }}
                />
              ))}
              
              {/* Custom candlesticks rendering */}
              {candleData.map((entry, index) => {
                const isGreen = entry.close > entry.open;
                return (
                  <g key={`candle-${index}`}>
                    {/* Main wick line */}
                    <line
                      x1={(index + 0.5) * (100 / candleData.length) + '%'} 
                      y1={isGreen ? entry.close : entry.open}
                      x2={(index + 0.5) * (100 / candleData.length) + '%'}
                      y2={entry.high}
                      stroke={isGreen ? '#00FF7F' : '#FF4136'}
                      strokeWidth={1}
                    />
                    <line
                      x1={(index + 0.5) * (100 / candleData.length) + '%'} 
                      y1={isGreen ? entry.open : entry.close}
                      x2={(index + 0.5) * (100 / candleData.length) + '%'}
                      y2={entry.low}
                      stroke={isGreen ? '#00FF7F' : '#FF4136'}
                      strokeWidth={1}
                    />
                    
                    {/* Candle body */}
                    <Rectangle
                      x={(index + 0.1) * (100 / candleData.length) + '%'}
                      y={Math.min(entry.open, entry.close)}
                      width={(0.8) * (100 / candleData.length) + '%'}
                      height={Math.max(1, Math.abs(entry.open - entry.close))}
                      fill={isGreen ? '#00FF7F' : '#FF4136'}
                    />
                  </g>
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
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
