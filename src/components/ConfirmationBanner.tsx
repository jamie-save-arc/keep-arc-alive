import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ConfirmationBannerProps {
  visible: boolean;
  compact?: boolean;
}

const ConfirmationBanner: React.FC<ConfirmationBannerProps> = ({ visible, compact = false }) => {
  if (!visible) return null;

  if (compact) {
    return (
      <div className="arc-confirmation-banner--compact">
        <div className="arc-confirmation-banner__content--compact">
          <div className="arc-confirmation-banner__icon-wrapper--compact">
            <CheckCircle className="arc-confirmation-banner__icon--compact" />
            <div className="arc-confirmation-banner__icon-glow--compact" />
          </div>
          
          <div className="arc-confirmation-banner__text--compact">
            <span className="arc-confirmation-banner__title--compact">
              Thank you! Your submission has been recorded.
            </span>
          </div>
        </div>
        
        {/* Compact animated background elements */}
        <div className="arc-confirmation-banner__particles--compact">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="arc-confirmation-banner__particle--compact"
              style={{
                '--delay': `${i * 0.15}s`,
                '--x': `${25 + i * 15}%`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="arc-confirmation-banner">
      <div className="arc-confirmation-banner__content">
        <div className="arc-confirmation-banner__icon-wrapper">
          <CheckCircle className="arc-confirmation-banner__icon" />
          <div className="arc-confirmation-banner__icon-glow" />
        </div>
        
        <div className="arc-confirmation-banner__text">
          <h3 className="arc-confirmation-banner__title">
            Thank You for Your Support!
          </h3>
          <p className="arc-confirmation-banner__subtitle">
            Your submission has been recorded. Here's how the movement is growing:
          </p>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="arc-confirmation-banner__bg-glow" />
      <div className="arc-confirmation-banner__particles">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="arc-confirmation-banner__particle"
            style={{
              '--delay': `${i * 0.1}s`,
              '--x': `${20 + i * 10}%`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default ConfirmationBanner;
