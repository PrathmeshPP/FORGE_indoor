import React from 'react';

interface WalkthroughHUDProps {
  isWalkthroughMode: boolean;
  onEnterWalkthrough: () => void;
  onExitWalkthrough: () => void;
  playerPos: [number, number, number];
  playerYaw: number;
  collisionStatus: 'CLEAR' | 'SLIDING' | 'BOUNDARY';
  fps: number;
  isPointerLocked: boolean;
  onRequestPointerLock: () => void;
}

export const WalkthroughHUD: React.FC<WalkthroughHUDProps> = ({
  isWalkthroughMode,
  onEnterWalkthrough,
  onExitWalkthrough,
  playerPos,
  playerYaw,
  collisionStatus,
  fps,
  isPointerLocked,
  onRequestPointerLock,
}) => {
  if (!isWalkthroughMode) {
    return (
      <div
        className="enter-space-container"
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
        }}
      >
        <button
          onClick={onEnterWalkthrough}
          className="enter-space-btn"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 20px rgba(2, 132, 199, 0.4), 0 0 10px rgba(56, 189, 248, 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          ENTER SPACE (WALKTHROUGH)
        </button>
      </div>
    );
  }

  const deg = Math.round(((-playerYaw * 180) / Math.PI) % 360);
  const normalizedDeg = deg < 0 ? deg + 360 : deg;

  const collisionColor =
    collisionStatus === 'CLEAR' ? '#4ade80' : collisionStatus === 'SLIDING' ? '#facc15' : '#f87171';

  return (
    <>
      {/* Reticle / Crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      />

      {/* Top Banner & Exit Button */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '6px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
            IMMERSIVE INDOOR TWIN
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>|</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>HUMAN EYE-LEVEL</span>
        </div>

        <button
          className="exit-space-btn"
          onClick={() => {
            console.log('[HUD] Exit button clicked!');
            onExitWalkthrough();
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            color: '#fca5a5',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
          }}
          title="Exit Space (G / Esc)"
        >
          ✕ EXIT SPACE [G]
        </button>
      </div>

      {/* Click-to-lock mouse overlay banner if pointer lock is lost */}
      {!isPointerLocked && (
        <div
          onClick={onRequestPointerLock}
          style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: 'rgba(2, 132, 199, 0.90)',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '8px 18px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
          }}
        >
          CLICK VIEWPORT TO RESUME MOUSE LOOK
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '8px 18px',
          display: 'flex',
          gap: '12px',
          fontSize: '11px',
          color: '#cbd5e1',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <span>
          <strong style={{ color: '#38bdf8' }}>WASD</strong> Move
        </span>
        <span style={{ color: '#475569' }}>•</span>
        <span>
          <strong style={{ color: '#38bdf8' }}>SPACE</strong> Up
        </span>
        <span style={{ color: '#475569' }}>•</span>
        <span>
          <strong style={{ color: '#38bdf8' }}>C</strong> Down
        </span>
        <span style={{ color: '#475569' }}>•</span>
        <span>
          <strong style={{ color: '#38bdf8' }}>SHIFT</strong> Sprint
        </span>
        <span style={{ color: '#475569' }}>•</span>
        <span>
          <strong style={{ color: '#38bdf8' }}>O</strong> Fly/Walk
        </span>
        <span style={{ color: '#475569' }}>•</span>
        <span>
          <strong style={{ color: '#38bdf8' }}>MOUSE</strong> Look Around
        </span>
        <span style={{ color: '#475569' }}>•</span>
        <span>
          <strong style={{ color: '#f87171' }}>G / ESC</strong> Exit
        </span>
      </div>

      {/* Telemetry Box (Top-Left under title) */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          zIndex: 25,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#94a3b8',
          fontFamily: 'monospace',
          lineHeight: 1.5,
          minWidth: '180px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>FPS:</span>
          <span style={{ color: fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171', fontWeight: 'bold' }}>
            {fps} FPS
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Position:</span>
          <span style={{ color: '#f8fafc' }}>
            [{playerPos[0].toFixed(2)}, {playerPos[2].toFixed(2)}]
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Heading:</span>
          <span style={{ color: '#f8fafc' }}>{normalizedDeg}°</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Collision:</span>
          <span style={{ color: collisionColor, fontWeight: 'bold' }}>{collisionStatus}</span>
        </div>
      </div>
    </>
  );
};
