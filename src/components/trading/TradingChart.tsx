import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import TimeframeSelector, { Timeframe } from './TimeframeSelector';
import { Order } from './OrderPanel';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Rectangle,
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
      close
    });
    
    lastClose = close;
  }
  
  return candles;
};

const CustomCandlestick = (props: any) => {
  const {
    x,
    y,
    width,
    height,
    open,
    close,
    low,
    high,
  } = props;

  const isGreen = close > open;
  const color = isGreen ? '#00FF7F' : '#FF4136';
  const wickY1 = Math.min(y, y + height);
  const wickY2 = Math.max(y, y + height);

  return (
    <g>
      {/* Wick line */}
      <line
        x1={x + width / 2}
        y1={low}
        x2={x + width / 2}
        y2={high}
        stroke={color}
        strokeWidth={1}
      />
      {/* Candle body */}
      <Rectangle
        x={x}
        y={isGreen ? y + height : y}
        width={width}
        height={Math.abs(height)}
        fill={color}
        stroke={color}
      />
    </g>
  );
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

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    toast({
      description: `Timeframe changed to ${newTimeframe}`,
    });
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
        ref={chartRef}
        className="chart-container flex-1 relative bg 
        bg-[#0A0A0A] rounded-lg border border-panel-border"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : selectedAsset ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={candleData}
              margin={{ top: 20, right: 30, left: 50, bottom: 30 }}
            >
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#666"
                tick={{ fill: '#999' }}
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatPrice}
                orientation="right"
                stroke="#666"
                tick={{ fill: '#999' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E2230',
                  border: '1px solid #2A2E39',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => formatPrice(value)}
                labelFormatter={(label) => formatXAxis(label as string)}
              />
              {orders.map((order) => (
                <ReferenceLine
                  key={order.id}
                  y={order.price}
                  stroke={order.direction === 'buy' ? '#00FF7F' : '#FF4136'}
                  strokeDasharray="3 3"
                />
              ))}
              {candleData.map((entry, index) => (
                <CustomCandlestick
                  key={`candle-${index}`}
                  x={index * 40}
                  open={entry.open}
                  close={entry.close}
                  high={entry.high}
                  low={entry.low}
                  height={Math.abs(entry.close - entry.open)}
                />
              ))}
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
