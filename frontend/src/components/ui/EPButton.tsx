import React from 'react';
import './EPButton.css';

interface EPButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium';
  icon?: 'download' | 'none' | string;
  loading?: boolean;
}

export const EPButton: React.FC<EPButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled,
  ...rest
}) => {
  const classes = [
    'ep-button',
    `ep-button-${variant}`,
    `ep-button-${size}`,
    loading ? 'ep-button-loading' : null
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;

  return (
    <button className={classes} disabled={isDisabled} {...rest}>
      {loading && <span className="ep-button-spinner" aria-hidden="true" />}
      {!loading && icon === 'download' && (
        <span className="ep-button-icon" aria-hidden="true">
          
          
          
          
          
          
          ↓
        </span>
      )}
      <span className="ep-button-label">{children}</span>
    </button>
  );
};
