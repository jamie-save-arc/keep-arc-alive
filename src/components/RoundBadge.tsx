import React from 'react';

interface RoundBadgeProps {
  triggerSpin?: boolean;
}

const RoundBadge: React.FC<RoundBadgeProps> = ({ triggerSpin = false }) => {
  const word1 = 'COMMUNITY';
  const word2 = 'INITIATIVE';
  
  return (
    <div className="arc-round-badge" aria-label="Community Initiative">
      <svg className="arc-round-badge__svg" viewBox="0 0 100 100" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="arcBadgeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>

        <circle 
          className="arc-round-badge__outer-ring" 
          cx="50" 
          cy="50" 
          r="48" 
          fill="url(#arcBadgeRingGradient)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* COMMUNITY and INITIATIVE with proper word spacing */}
        <g className={`arc-round-badge__text-group ${triggerSpin ? 'arc-round-badge__text-group--fast-spin' : ''}`}>
          {(() => {
            const word1Letters = word1.split('');
            const word2Letters = word2.split('');
            const totalVisibleLetters = word1Letters.length + word2Letters.length;
            
            // Calculate arc lengths: more compact words with equal gaps
            const wordArcLength = 140; // degrees per word (more compact)
            const gapBetweenWords = (360 - (wordArcLength * 2)) / 2; // equal gaps
            
            const elements = [];
            
            // Position COMMUNITY (starting from top)
            word1Letters.forEach((letter, index) => {
              const angle = -90 + (index / (word1Letters.length - 1)) * wordArcLength;
              const radius = 41;
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
              
              elements.push(
                <text
                  key={`word1-${index}`}
                  x={x}
                  y={y}
                  className="arc-round-badge__letter"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${angle + 90}, ${x}, ${y})`}
                >
                  {letter}
                </text>
              );
            });
            
            // Position INITIATIVE (starting after COMMUNITY + gap)
            word2Letters.forEach((letter, index) => {
              const startAngle = -90 + wordArcLength + gapBetweenWords;
              const angle = startAngle + (index / (word2Letters.length - 1)) * wordArcLength;
              const radius = 41;
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
              
              elements.push(
                <text
                  key={`word2-${index}`}
                  x={x}
                  y={y}
                  className="arc-round-badge__letter"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${angle + 90}, ${x}, ${y})`}
                >
                  {letter}
                </text>
              );
            });
            
            return elements;
          })()}
        </g>
      </svg>

      <div className="arc-round-badge__center">
        <div className="arc-round-badge__center-bg" />
        <span className="arc-round-badge__center-text">ARC</span>
      </div>
    </div>
  );
};

export default RoundBadge;


