import React from 'react';
import './EPSkeleton.css';

interface EPSkeletonProps {
  width?: number | string;
  height?: number | string;
}

export const EPSkeleton: React.FC<EPSkeletonProps> = ({ width = '100%', height = 16 }) => {
  const style: React.CSSProperties = {
    width,
    height
  };
  return <div className="ep-skeleton" style={style} />;
};
