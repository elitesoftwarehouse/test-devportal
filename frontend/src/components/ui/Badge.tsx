import React from 'react';
import { cn } from '../../lib/utils';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className,
}) => {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

