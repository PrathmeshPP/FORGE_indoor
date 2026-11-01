import React from 'react';
import { Layers, Database, Box } from 'lucide-react';
import type { ActiveGeometryStats } from '../types';

interface GeometryStatsDisplayProps {
  stats: ActiveGeometryStats | null;
  mode: 'overlay' | 'inspector';
}

export const GeometryStatsDisplay: React.FC<GeometryStatsDisplayProps> = ({
  stats,
  mode,
}) => {
  const formatCount = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) {
      return 'Unavailable';
    }
    return val.toLocaleString();
  };

  if (mode === 'overlay') {
    return (
      <div className="geometry-stats-overlay">
        <div className="stats-row">
          <span className="stats-label">Source Asset:</span>
          <span className="stats-val mono highlight">{stats?.sourceFileName || 'Unavailable'}</span>
        </div>
        <div className="stats-row" title="Unique geometric vertices in the source mesh representation">
          <span className="stats-label">Unique Vertices:</span>
          <span className="stats-val">{formatCount(stats?.uniqueVertices)}</span>
        </div>
        <div className="stats-row" title="Actual GPU position-buffer entries loaded in Three.js (non-indexed OBJ meshes allocate 3 positions per triangle)">
          <span className="stats-label">Rendered Positions:</span>
          <span className="stats-val">{formatCount(stats?.renderedPositions)}</span>
        </div>
        <div className="stats-row" title="Verified count of rendered planar triangles">
          <span className="stats-label">Triangles:</span>
          <span className="stats-val">{formatCount(stats?.triangles)}</span>
        </div>
      </div>
    );
  }

  // Inspector Card Mode
  return (
    <div className="inspector-card">
      <div className="card-heading">
        <span>Active Geometry & Asset Statistics</span>
        <Layers size={13} color="var(--accent-cyan)" />
      </div>

      <div className="stat-grid" style={{ marginTop: '0.2rem' }}>
        <div className="stat-item full-width" style={{ gridColumn: 'span 2' }}>
          <span className="stat-label">Source Asset Filename</span>
          <span className="stat-val mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
            <Database size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
            {stats?.sourceFileName || 'Unavailable'}
          </span>
        </div>

        <div className="stat-item" title="Topological unique vertices in the loaded mesh file">
          <span className="stat-label">Unique Geometry Vertices</span>
          <span className="stat-val">{formatCount(stats?.uniqueVertices)}</span>
        </div>

        <div className="stat-item" title="Three.js WebGL GPU position buffer count">
          <span className="stat-label">Rendered Position Entries</span>
          <span className="stat-val" style={{ color: stats?.format === 'OBJ' ? 'var(--accent-amber)' : 'inherit' }}>
            {formatCount(stats?.renderedPositions)}
          </span>
        </div>

        <div className="stat-item" title="Actual planar triangle count rendered in the active viewport">
          <span className="stat-label">Triangle Count</span>
          <span className="stat-val">{formatCount(stats?.triangles)}</span>
        </div>

        <div className="stat-item" title="Representation memory buffer architecture">
          <span className="stat-label">Buffer Structure</span>
          <span className="stat-val" style={{ fontSize: '0.72rem' }}>
            <Box size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
            {stats?.format === 'OBJ'
              ? 'Non-Indexed Buffer (3 pos/tri)'
              : stats?.format === 'PLY'
              ? 'Indexed Unique Vertex Buffer'
              : 'Unavailable'}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.4 }}>
        {stats?.format === 'OBJ' ? (
          <span>
            * Three.js <code>OBJLoader</code> allocates 3 independent position-buffer entries per face for unindexed rendering ({formatCount(stats?.triangles)} &times; 3 = {formatCount(stats?.renderedPositions)} entries), while the source mesh contains {formatCount(stats?.uniqueVertices)} unique topological vertices.
          </span>
        ) : (
          <span>
            * PLY representations utilize direct indexed buffer geometry where rendered position-buffer count matches unique source vertices ({formatCount(stats?.uniqueVertices)}).
          </span>
        )}
      </div>
    </div>
  );
};
