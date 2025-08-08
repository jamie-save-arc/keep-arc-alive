import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import ConfirmationBanner from './ConfirmationBanner';

interface Signup {
  id: string;
  name: string;
  monthlyAmount: number;
  timestamp: number;
}

interface ResultsCardProps {
  signups: Signup[];
}

// Generate demo data for realistic growth curve
const generateDemoData = (days: number) => {
  const data = [];
  const baseDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  let cumulativeUsers = Math.floor(Math.random() * 50) + 20; // Start with 20-70 users
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate + (i * 24 * 60 * 60 * 1000));
    
    // Simulate realistic growth with some randomness
    const growthRate = 0.02 + (Math.random() * 0.03); // 2-5% daily growth
    const dailyGrowth = Math.floor(cumulativeUsers * growthRate) + Math.floor(Math.random() * 5);
    cumulativeUsers += dailyGrowth;
    
    // Add some weekend slowdown
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      cumulativeUsers -= Math.floor(dailyGrowth * 0.3);
    }
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pledgedUsers: Math.max(cumulativeUsers, 0),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      index: i
    });
  }
  
  // Add today's date as the final data point
  const today = new Date();
  const todayGrowth = Math.floor(cumulativeUsers * 0.025) + Math.floor(Math.random() * 3);
  data.push({
    date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pledgedUsers: Math.max(cumulativeUsers + todayGrowth, 0),
    fullDate: today.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }),
    index: days,
    isToday: true
  });
  
  return data;
};

const ResultsCard: React.FC<ResultsCardProps> = () => {
  const [timeFrame, setTimeFrame] = useState<'7d' | '30d' | '90d'>('30d');
  const [showBanner, setShowBanner] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const getDays = (frame: string) => {
    switch (frame) {
      case '7d': return 7;
      case '30d': return 28; // 4 weeks for equal weekly sections
      case '90d': return 84; // 12 weeks for equal weekly sections
      default: return 30;
    }
  };
  
  const chartData = generateDemoData(getDays(timeFrame));
  
  // Generate nice Y-axis ticks with rounded numbers
  const generateYAxisTicks = (data: any[]) => {
    if (data.length === 0) return [0, 50, 100, 150, 200];
    
    const maxValue = Math.max(...data.map(d => d.pledgedUsers));
    const minValue = 0; // Always start from 0
    
    // Calculate a nice step size
    const range = maxValue - minValue;
    const roughStep = range / 5; // Aim for about 5-6 ticks
    
    // Round to nice numbers (10, 20, 25, 50, 100, etc.)
    let step;
    if (roughStep <= 10) step = 10;
    else if (roughStep <= 20) step = 20;
    else if (roughStep <= 25) step = 25;
    else if (roughStep <= 50) step = 50;
    else if (roughStep <= 100) step = 100;
    else step = Math.ceil(roughStep / 100) * 100;
    
    // Generate ticks
    const ticks = [];
    for (let i = minValue; i <= maxValue + step; i += step) {
      ticks.push(i);
    }
    
    return ticks;
  };
  
  const yAxisTicks = generateYAxisTicks(chartData);
  
  // Generate X-axis tick LABELS (category values) to control tick positions
  // Returning the actual category strings ensures grid lines align with labels
  const generateXAxisTicks = (data: any[], timeFrame: string) => {
    if (data.length === 0) return [];
    
    const tickIndices: number[] = [];
    const length = data.length;
    
    if (timeFrame === '7d') {
      // Show every day for 7-day view
      for (let i = 0; i < length; i++) {
        tickIndices.push(i);
      }
    } else if (timeFrame === '30d') {
      // Start with today (last index) and go back in 7-day intervals
      // Use 5 markers (Today, -7d, -14d, -21d, -28d) to create 4 equal weekly sections
      tickIndices.push(length - 1); // Today
      
      // Go back in 7-day intervals up to 28 days back
      for (let daysBack = 7; daysBack <= 28; daysBack += 7) {
        const index = length - 1 - daysBack;
        if (index >= 0) {
          tickIndices.push(index);
        }
      }
      
      // Sort in ascending order for proper display
      tickIndices.sort((a, b) => a - b);
    } else { // 90d => 12 weeks
      // On mobile, show fewer ticks for 90d view
      if (isMobile) {
        // Show ticks every 3 weeks (21 days) on mobile - about 5 labels total
        for (let delta = 84; delta >= 0; delta -= 21) {
          const idx = length - 1 - delta;
          if (idx >= 0) tickIndices.push(idx);
        }
      } else {
        // Weekly ticks from -84 to 0 days (13 markers) on desktop
        for (let delta = 84; delta >= 0; delta -= 7) {
          const idx = length - 1 - delta;
          if (idx >= 0) tickIndices.push(idx);
        }
      }
    }
    
    // Map indices to actual category labels (dates) and dedupe
    const labels = tickIndices
      .sort((a, b) => a - b)
      .map((idx) => data[idx]?.date)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
    return labels as string[];
  };
  
  const xAxisTicks = generateXAxisTicks(chartData, timeFrame);
  
  // For 4 Weeks view, compute equal-spaced weekly tick indices on a numeric axis
  const weeklyTickIndices = (() => {
    const last = chartData.length - 1; // today
    if (last < 0) return [] as number[];
    const ticks: number[] = [];
    // For 4 Weeks (28 days): -28, -21, -14, -7, 0
    if (timeFrame === '30d') {
      for (let delta = 28; delta >= 0; delta -= 7) {
        const idx = last - delta;
        if (idx >= 0) ticks.push(idx);
      }
    }
    // For 3 Months (12 weeks/84 days): -84, -77, ..., -7, 0
    if (timeFrame === '90d') {
      for (let delta = 84; delta >= 0; delta -= 7) {
        const idx = last - delta;
        if (idx >= 0) ticks.push(idx);
      }
    }
    return ticks;
  })();
  
  // Auto-hide banner after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
      // Wait for fade-out animation to complete before hiding
      setTimeout(() => {
        setShowBanner(false);
      }, 500); // 500ms fade-out duration
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, []);
  
  // Handle responsive state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="arc-results-card arc-results-card--full-width">
      {showBanner && (
        <div className={`arc-confirmation-wrapper ${isAnimatingOut ? 'arc-confirmation-wrapper--fade-out' : ''}`}>
          <ConfirmationBanner visible={true} compact={true} />
        </div>
      )}
      
      <div className={`arc-results-card__chart ${!showBanner ? 'arc-results-card__chart--moved-up' : ''}`}>
        <div className="arc-results-card__chart-header">
          <h3 className="arc-results-card__chart-title">Pledged Users Over Time</h3>
          <div className="arc-timeframe-selector">
            {(['7d', '30d', '90d'] as const).map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame)}
                className={`arc-timeframe-btn ${timeFrame === frame ? 'arc-timeframe-btn--active' : ''}`}
              >
                {frame === '7d' ? '7 Days' : frame === '30d' ? '4 Weeks' : '3 Months'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="arc-results-chart arc-results-chart--anim">
          <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
            <LineChart data={chartData} margin={{ 
              top: isMobile ? 16 : 24, 
              right: isMobile ? 20 : 24, 
              left: isMobile ? 8 : 16, 
              bottom: isMobile ? 16 : 24 
            }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#63656B', dy: 8 }}
                interval={0}
                ticks={xAxisTicks}
                tickMargin={12}
                tickFormatter={(value) => {
                  if (timeFrame === '7d') {
                    // For 7-day view show weekday labels; the dataKey remains date but we convert label visually
                    const found = chartData.find((d) => d.date === value);
                    if (found?.isToday) return 'Today';
                    // Reconstruct weekday from fullDate for accuracy
                    return found?.fullDate?.split(',')[0] || value;
                  }
                  // For 30d/90d use date labels directly; today already equals actual date string
                  return value;
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#63656B', dx: -8 }}
                width={60}
                tickMargin={8}
                domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
                ticks={yAxisTicks}
                type="number"
              />
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth={1}
                opacity={0.6}
                horizontal={true}
                vertical={timeFrame === '7d'}
              />
              {/* Use ReferenceLine to guarantee proper coordinate system alignment */}
              {(timeFrame === '30d' || timeFrame === '90d') && weeklyTickIndices.length > 0 && (
                <>
                  {weeklyTickIndices.map((idx) => (
                    <ReferenceLine
                      key={`ref-week-${idx}`}
                      x={chartData[idx]?.date}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="2 4"
                      strokeWidth={1}
                      ifOverflow="hidden"
                    />
                  ))}
                </>
              )}
              <Tooltip 
                contentStyle={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  padding: '12px'
                }}
                labelStyle={{ color: '#94969C', marginBottom: '4px' }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} Pledged Users`
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
                separator=""
              />
              <Line 
                type="monotone" 
                dataKey="pledgedUsers" 
                stroke="url(#lineGradient)"
                strokeWidth={4}
                dot={false}
                activeDot={{ 
                  r: 8, 
                  fill: '#3B82F6',
                  stroke: '#FFFFFF',
                  strokeWidth: 3
                }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;