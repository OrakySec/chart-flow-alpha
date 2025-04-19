
import React from 'react';
import { Clock } from 'lucide-react';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

interface TimeframeSelectorProps {
  activeTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const timeframes: { value: Timeframe, label: string }[] = [
  { value: '1m', label: '1 min' },
  { value: '5m', label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hour' },
  { value: '1d', label: '1 day' },
];

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ 
  activeTimeframe, 
  onTimeframeChange 
}) => {
  return (
    <div className="flex items-center space-x-1 bg-panel-bg p-1 rounded-lg shadow-md">
      <div className="p-1.5 text-muted-foreground">
        <Clock size={16} />
      </div>
      
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.value}
          onClick={() => onTimeframeChange(timeframe.value)}
          className={`timeframe-button ${activeTimeframe === timeframe.value ? 'active' : ''}`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
