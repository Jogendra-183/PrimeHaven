import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const PropertyCardSkeleton = () => {
  return (
    <div className="card-surface" style={{ overflow: 'hidden', padding: 0 }}>
      <Skeleton height="220px" borderRadius="0" />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton width="45%" height="18px" />
        <Skeleton width="80%" height="24px" />
        <Skeleton width="60%" height="16px" />
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <Skeleton width="30%" height="16px" />
          <Skeleton width="30%" height="16px" />
          <Skeleton width="30%" height="16px" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <Skeleton width="70%" height="14px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <Skeleton width={c === 0 ? '85%' : '60%'} height="16px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Skeleton;
