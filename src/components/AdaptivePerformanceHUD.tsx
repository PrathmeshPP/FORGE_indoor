import React, { useState } from 'react';
import type { PerformanceHUDStats, QualityMode } from '../types';

interface AdaptivePerformanceHUDProps {
  stats: PerformanceHUDStats;
  onQualityModeChange: (mode: QualityMode) => void;
  onDprChange?: (dpr: number) => void;
  isOpen?: boolean;
}

export const AdaptivePerformanceHUD: React.FC<AdaptivePerformanceHUDProps> = ({
  stats,
  onQualityModeChange,
  onDprChange,
  isOpen = true,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (!isOpen) return null;

  const fpsColor = stats.fps >= 50 ? '#4ade80' : stats.fps >= 28 ? '#facc15' : '#f87171';
  const gpuColor = stats.gpuMs <= 16.6 ? '#4ade80' : stats.gpuMs <= 33.3 ? '#facc15' : '#f87171';

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 40,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '10px',
        padding: '12px 16px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '11px',
        color: '#e2e8f0',
        minWidth: '260px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '8px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: stats.qualityMode === 'auto' ? '#38bdf8' : '#a855f7',
              boxShadow: stats.qualityMode === 'auto' ? '0 0 8px #38bdf8' : '0 0 8px #a855f7',
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: '0.06em', color: '#38bdf8' }}>
            F.O.R.G.E. ADAPTIVE GPU HUD
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px 4px',
            fontSize: '11px',
          }}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Real-time Performance Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px' }}>
              <div style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}>FPS (1% Low)</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: fpsColor }}>
                {stats.fps} <span style={{ fontSize: '10px', color: '#94a3b8' }}>({stats.fpsLow})</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px' }}>
              <div style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}>GPU Frame Time</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: gpuColor }}>
                {stats.gpuMs.toFixed(2)} <span style={{ fontSize: '10px', color: '#94a3b8' }}>ms</span>
              </div>
            </div>
          </div>

          {/* Secondary Timing & Resolution */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>CPU Stage:</span>
            <span style={{ fontWeight: 600 }}>{stats.cpuMs.toFixed(2)} ms</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Viewport Res:</span>
            <span style={{ fontWeight: 600 }}>{stats.resolution} (DPR {stats.dpr.toFixed(2)}x)</span>
          </div>

          {/* Geometry & Chunk Stats */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Active LOD:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{stats.activeLOD}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Visible Geometry:</span>
              <span style={{ fontWeight: 600 }}>{stats.visibleTriangles.toLocaleString()} tris</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Culled Geometry:</span>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{stats.culledTriangles.toLocaleString()} tris</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Spatial Chunks:</span>
              <span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{stats.highDetailChunks}H</span> ·{' '}
                <span style={{ color: '#4ade80', fontWeight: 700 }}>{stats.mediumDetailChunks}M</span> ·{' '}
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>{stats.lowDetailChunks}L</span>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Draw Calls:</span>
              <span style={{ fontWeight: 600 }}>{stats.drawCalls}</span>
            </div>
          </div>

          {/* Quality Mode Controller */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px', marginTop: '6px' }}>
            <div style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Adaptive Quality Controller
            </div>
            <select
              value={stats.qualityMode}
              onChange={(e) => onQualityModeChange(e.target.value as QualityMode)}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '5px 8px',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="auto">✨ Auto Adaptive (Dynamic Frame Budget)</option>
              <option value="performance">⚡ Performance (Forced Low / Fast)</option>
              <option value="balanced">⚖️ Balanced (LOD 1 Central / LOD 2 Far)</option>
              <option value="high">🔍 High Quality (LOD 0 Central / LOD 1 Far)</option>
              <option value="maximum">💎 Maximum Detail (Forced Full LOD 0)</option>
            </select>
          </div>

          {/* DPR / Resolution Slider */}
          {onDprChange && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#94a3b8' }}>Resolution Scale:</span>
                <span>{stats.dpr.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={stats.dpr}
                onChange={(e) => onDprChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
