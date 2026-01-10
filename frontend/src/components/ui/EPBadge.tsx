import React from 'react';
import './EPBadge.css';

interface EPBadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'danger' | 'outline';
  size?: 'small' | 'medium';
  className?: string;
}

export const EPBadge: React.FC<EPBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'medium',
  className
}) => {
  const classes = ['ep-badge', `ep-badge-${variant}`, `ep-badge-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
};
