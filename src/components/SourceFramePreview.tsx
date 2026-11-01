import React, { useState } from 'react';
import type { TrajectoryPoint } from '../navigation/FirstPersonNavigationEngine';

interface SourceFramePreviewProps {
  currentFrame: TrajectoryPoint | null;
  distanceMeters: number;
}

export const SourceFramePreview: React.FC<SourceFramePreviewProps> = ({
  currentFrame,
  distanceMeters,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!currentFrame) return null;

  return (
    <>
      <div
        className="source-frame-preview-panel"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          zIndex: 25,
          background: 'rgba(15, 23, 42, 0.90)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '10px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '260px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>
            SOURCE CAPTURE PREVIEW
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '2px 4px',
              textDecoration: 'underline',
            }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            width: isExpanded ? '236px' : '150px',
            height: isExpanded ? '320px' : '190px',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #1e293b',
            background: '#090d16',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
          title="Click to toggle expanded comparison"
        >
          <img
            src={currentFrame.frame_url}
            alt={`Video frame at ${currentFrame.timestamp_sec}s`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.75)',
              padding: '1px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              color: '#f8fafc',
              fontWeight: 600,
            }}
          >
            {currentFrame.timestamp_sec.toFixed(2)}s
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Nearest Capture Point:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>Cam #{currentFrame.index}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Proximity Distance:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{distanceMeters.toFixed(2)} m</span>
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
            Updates in real-time as you navigate the interior.
          </div>
        </div>
      </div>
    </>
  );
};

