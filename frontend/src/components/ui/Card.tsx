import React from 'react';
import { cn } from '../../lib/utils';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = true,
  hover = false,
}) => {
  return (
    <div
      className={cn(
        styles.card,
        styles[`padding-${padding}`],
        shadow && styles.shadow,
        hover && styles.hover,
        className
      )}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, action }) => {
  return (
    <div className={cn(styles.header, className)}>
      <div className={styles.headerContent}>{children}</div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <h3 className={cn(styles.title, className)}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <p className={cn(styles.description, className)}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn(styles.content, className)}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn(styles.footer, className)}>{children}</div>;
};

export default Card;

