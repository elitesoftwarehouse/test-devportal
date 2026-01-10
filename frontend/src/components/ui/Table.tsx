import React from 'react';
import { cn } from '../../lib/utils';
import styles from './Table.module.css';

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, className)}>{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children, className }) => {
  return <thead className={cn(styles.header, className)}>{children}</thead>;
};

export const TableBody: React.FC<TableProps> = ({ children, className }) => {
  return <tbody className={cn(styles.body, className)}>{children}</tbody>;
};

export const TableRow: React.FC<TableProps & { hover?: boolean; onClick?: () => void }> = ({
  children,
  className,
  hover = true,
  onClick,
}) => {
  return (
    <tr
      className={cn(styles.row, hover && styles.rowHover, onClick && styles.clickable, className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableHead: React.FC<TableCellProps> = ({ children, className, align = 'left' }) => {
  return <th className={cn(styles.th, styles[`align-${align}`], className)}>{children}</th>;
};

export const TableCell: React.FC<TableCellProps> = ({ children, className, align = 'left' }) => {
  return <td className={cn(styles.td, styles[`align-${align}`], className)}>{children}</td>;
};

// Empty state component
export const TableEmpty: React.FC<{ message?: string; colSpan?: number }> = ({
  message = 'Nessun dato disponibile',
  colSpan = 1,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.empty}>
        <div className={styles.emptyContent}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 12V8H4V12M20 12V20H4V12M20 12H4M12 8V4M8 4H16" />
          </svg>
          <p>{message}</p>
        </div>
      </td>
    </tr>
  );
};

export default Table;

