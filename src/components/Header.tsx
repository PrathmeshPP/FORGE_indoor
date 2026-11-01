import React from 'react';
import { Box, Maximize2, Minimize2, HelpCircle, Columns, Eye, Workflow } from 'lucide-react';
import type { SceneEntry } from '../types';

interface HeaderProps {
  activeScene: SceneEntry;
  isLoading: boolean;
  loadProgress: number;
  isComparisonMode: boolean;
  onToggleComparison: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenHelp: () => void;
  onOpenWorkflow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScene,
  isLoading,
  loadProgress,
  isComparisonMode,
  onToggleComparison,
  isFullscreen,
  onToggleFullscreen,
  onOpenHelp,
  onOpenWorkflow,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <Box size={20} color="#fff" />
        </div>
        <div className="brand-text">
          <h1>
            F.O.R.G.E Explorer
            <span className="badge-version">v1.2.0 · Hackathon Demo</span>
          </h1>
        </div>
      </div>

      <div className="header-status">
        <div className="scene-indicator">
          <div
            className={`status-dot ${
              isLoading
                ? 'loading'
                : activeScene.acceptance_status === 'PASS'
                ? 'pass'
                : 'partial'
            }`}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {isComparisonMode
              ? 'Desert Road (Candidate A vs Candidate B)'
              : activeScene.display_name}
          </span>
          <span
            className={`badge ${
              activeScene.acceptance_status === 'PASS' ? 'pass' : 'partial'
            }`}
            style={{ fontSize: '0.65rem' }}
          >
            {isComparisonMode ? 'DUAL VIEW' : activeScene.acceptance_status}
          </span>
        </div>

        {isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div
              className="spinner"
              style={{ width: '16px', height: '16px', borderWidth: '2px' }}
            />
            <span>{loadProgress > 0 ? `${loadProgress}%` : 'Loading Model...'}</span>
          </div>
        )}
      </div>

      <div className="header-actions">
        <button
          className="btn-action"
          onClick={onOpenWorkflow}
          title="Open Engineering Workflow & Pipeline Architecture"
        >
          <Workflow size={15} color="var(--accent-cyan)" />
          <span>Pipeline Architecture</span>
        </button>

        <button
          className={`btn-action ${isComparisonMode ? 'primary' : ''}`}
          onClick={onToggleComparison}
          title="Toggle Side-by-Side Comparison (Desert Road A vs B)"
        >
          {isComparisonMode ? <Eye size={15} /> : <Columns size={15} />}
          <span>{isComparisonMode ? 'Single View' : 'Compare A vs B'}</span>
        </button>

        <button
          className="btn-icon"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        <button
          className="btn-icon"
          onClick={onOpenHelp}
          title="Controls & Navigation Reference"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
};
