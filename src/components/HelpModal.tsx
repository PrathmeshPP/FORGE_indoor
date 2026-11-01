import React from 'react';
import { X, Navigation, Keyboard, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Navigation size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              F.O.R.G.E Explorer Navigation & Controls
            </span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Navigation Controls */}
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Navigation size={15} />
              <span>Mouse & Touch Gestures</span>
            </div>
            <div className="shortcut-row">
              <span>Orbit / Rotate</span>
              <span className="kbd">Left Click + Drag</span>
            </div>
            <div className="shortcut-row">
              <span>Pan Viewport</span>
              <span className="kbd">Right Click + Drag</span>
            </div>
            <div className="shortcut-row">
              <span>Zoom In / Out</span>
              <span className="kbd">Scroll Wheel / Pinch</span>
            </div>
          </div>

          {/* First-Person Walkthrough & Fly Controls */}
          <div>
            <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Navigation size={15} />
              <span>First-Person Walkthrough & Fly Controls</span>
            </div>
            <div className="shortcut-row">
              <span>Move Forward / Backward</span>
              <span className="kbd">W / S (or Arrows)</span>
            </div>
            <div className="shortcut-row">
              <span>Strafe Left / Right</span>
              <span className="kbd">A / D</span>
            </div>
            <div className="shortcut-row">
              <span>Move Upward (Ascend)</span>
              <span className="kbd">Space</span>
            </div>
            <div className="shortcut-row">
              <span>Move Downward (Descend)</span>
              <span className="kbd">C</span>
            </div>
            <div className="shortcut-row">
              <span>Sprint / Move Faster</span>
              <span className="kbd">Shift</span>
            </div>
            <div className="shortcut-row">
              <span>Toggle Walk / Fly Mode</span>
              <span className="kbd">O</span>
            </div>
            <div className="shortcut-row">
              <span>Look Around / Pitch & Yaw</span>
              <span className="kbd">Mouse (Pointer Lock)</span>
            </div>
            <div className="shortcut-row">
              <span>Exit Walkthrough</span>
              <span className="kbd">G / Esc</span>
            </div>
          </div>

          {/* Inspection View Shortcuts */}
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Keyboard size={15} />
              <span>Inspection View Shortcuts</span>
            </div>
            <div className="shortcut-row">
              <span>Top View Preset</span>
              <span className="kbd">1</span>
            </div>
            <div className="shortcut-row">
              <span>Front View Preset</span>
              <span className="kbd">2</span>
            </div>
            <div className="shortcut-row">
              <span>Side View Preset</span>
              <span className="kbd">3</span>
            </div>
            <div className="shortcut-row">
              <span>Isometric Preset</span>
              <span className="kbd">4</span>
            </div>
            <div className="shortcut-row">
              <span>Reset Camera</span>
              <span className="kbd">R</span>
            </div>
            <div className="shortcut-row">
              <span>Toggle Wireframe</span>
              <span className="kbd">W</span>
            </div>
            <div className="shortcut-row">
              <span>Toggle Ground Grid</span>
              <span className="kbd">G</span>
            </div>
            <div className="shortcut-row">
              <span>Toggle A/B Comparison</span>
              <span className="kbd">C</span>
            </div>
            <div className="shortcut-row">
              <span>Pipeline Architecture Modal</span>
              <span className="kbd">P</span>
            </div>
          </div>

          {/* Provenance Notice */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} />
              <span>Sprint 9 Release Baseline Verification</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              All models rendered are loaded directly from the verified Sprint 9 video-to-3D release artifacts (<code style={{ color: 'var(--accent-cyan)' }}>outputs/accuracy_experiment/sprint9_video_to_viewer_release/</code>). No synthetic mockups or modified geometries are served.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
