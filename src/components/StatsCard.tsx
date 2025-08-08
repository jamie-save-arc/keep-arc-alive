import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon: Icon, 
  label, 
  value
}) => {
  return (
    <div className="arc-stat-card">
      <div className="arc-stat-card__header">
        <Icon className="arc-stat-card__icon" />
        <h3 className="arc-stat-card__label">{label}</h3>
      </div>
      <div className="arc-stat-card__value" aria-label={`${label}: ${value}`}>{value}</div>
      <div className="arc-stat-card__glow" />
    </div>
  );
};

export default StatsCard;