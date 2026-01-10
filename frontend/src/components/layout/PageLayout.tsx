import React from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="ep-page-layout">
      {title && (
        <header className="ep-page-header">
          <h1 className="ep-page-title">{title}</h1>
        </header>
      )}
      <main className="ep-page-content">{children}</main>
    </div>
  );
};
