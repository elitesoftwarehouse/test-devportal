import React from 'react';
import './EPAlert.css';

interface EPAlertProps {
  severity: 'info' | 'error' | 'warning' | 'success';
  title?: string;
  children?: React.ReactNode;
}

export const EPAlert: React.FC<EPAlertProps> = ({ severity, title, children }) => {
  const classes = ['ep-alert', `ep-alert-${severity}`].join(' ');

  return (
    <div className={classes} role={severity === 'error' ? 'alert' : 'status'}>
      {title && <div className="ep-alert-title">{title}</div>}
      {children && <div className="ep-alert-content">{children}</div>}
    </div>
  );
};
