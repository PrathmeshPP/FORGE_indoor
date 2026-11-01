import React, { useState } from 'react';
import { Viewport3D } from './Viewport3D';
import type { CameraPresetAction, SceneEntry, RepresentationType, ViewportConfig, BoundingBoxInfo } from '../types';
import { Link2, Unlink, Crosshair, MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ComparisonViewProps {
  sceneA: SceneEntry;
  sceneB: SceneEntry;
  representation: RepresentationType;
  config: ViewportConfig;
  onLoadingChange: (loading: boolean, progress: number) => void;
  onBoundingBoxChange?: (info: BoundingBoxInfo) => void;
  presetAction?: CameraPresetAction;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  sceneA,
  sceneB,
  representation,
  config,
  onLoadingChange,
  onBoundingBoxChange,
  presetAction,
}) => {
  const [syncCameras, setSyncCameras] = useState<boolean>(true);
  const [showInset, setShowInset] = useState<boolean>(true);

  // Matched initial camera framing
  const [syncedState, setSyncedState] = useState<{
    position: [number, number, number];
    target: [number, number, number];
  }>({
    position: [0.0, 3.2, 1.8],
    target: [0.0, 0.0, -0.4],
  });

  const handleCameraUpdate = (pos: [number, number, number], target: [number, number, number]) => {
    if (syncCameras) {
      setSyncedState({ position: pos, target: target });
    }
  };

  const handleFocusVehicle = () => {
    // Focus camera directly on preserved Mini Cooper at [0.03, 0.04, 0.45]
    // Modifies camera position and target only; underlying mesh geometry is completely unchanged.
    setSyncedState({
      position: [0.33, 0.28, 0.98],
      target: [0.084, -0.053, 0.536],
    });
  };

  const handleFullRoad = () => {
    // Return camera to full corridor overview
    setSyncedState({
      position: [0.0, 3.2, 1.8],
      target: [0.0, 0.0, -0.4],
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Comparison Top Controls Bar */}
      <div
        style={{
          height: '42px',
          background: 'rgba(15, 23, 42, 0.96)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
            Desert Road Dual Candidate Comparison
          </span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
            A: Static Clean Highway vs B: Preserved Vehicle (Zero Road Box)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Focus Vehicle Action */}
          <button
            className="btn-action primary"
            onClick={handleFocusVehicle}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
            title="Focus camera directly on the vehicle coordinate [0.03, 0.04, 0.45] (framing change only)"
          >
            <Crosshair size={13} />
            <span>Focus Vehicle</span>
          </button>

          {/* Full Road Action */}
          <button
            className="btn-action"
            onClick={handleFullRoad}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
            title="Return camera framing to full desert corridor"
          >
            <MapPin size={13} />
            <span>Full Road</span>
          </button>

          {/* Link / Unlink Cameras Toggle */}
          <button
            className={`btn-action ${syncCameras ? 'active' : ''}`}
            onClick={() => setSyncCameras(!syncCameras)}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
            title="Toggle synchronized camera motion across both viewports"
          >
            {syncCameras ? <Link2 size={13} /> : <Unlink size={13} />}
            <span>{syncCameras ? 'Cameras Linked' : 'Independent'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Viewports Container */}
      <div className="comparison-container" style={{ position: 'relative', flex: 1, display: 'flex' }}>
        {/* Left Pane: Candidate A */}
        <div className="comparison-pane" style={{ position: 'relative', flex: 1 }}>
          <div className="comparison-header-badge">
            <span className="badge pass">CANDIDATE A</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
              Clean Highway (Zero Moving Objects)
            </span>
          </div>
          <Viewport3D
            scene={sceneA}
            representation={representation}
            config={config}
            onLoadingChange={onLoadingChange}
            onBoundingBoxChange={onBoundingBoxChange}
            syncCameraState={syncCameras ? syncedState : undefined}
            onCameraUpdate={handleCameraUpdate}
            customTitle="Candidate A: Clean Highway Corridor"
            presetAction={presetAction}
          />
        </div>

        {/* Right Pane: Candidate B */}
        <div className="comparison-pane" style={{ position: 'relative', flex: 1 }}>
          <div className="comparison-header-badge">
            <span className="badge pass">CANDIDATE B</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
              Preserved Vehicle (Tight Instance Mask)
            </span>
          </div>
          <Viewport3D
            scene={sceneB}
            representation={representation}
            config={config}
            onLoadingChange={onLoadingChange}
            syncCameraState={syncCameras ? syncedState : undefined}
            onCameraUpdate={handleCameraUpdate}
            customTitle="Candidate B: Vehicle Preserved (Zero Box)"
            presetAction={presetAction}
          />

          {/* Vehicle Close-up Inset Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '4.5rem',
              right: '1rem',
              zIndex: 25,
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              maxWidth: '220px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.6rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
              }}
              onClick={() => setShowInset(!showInset)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: '#fff' }}>
                <Crosshair size={12} color="var(--accent-cyan)" />
                <span>Vehicle Inset</span>
              </div>
              {showInset ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronUp size={14} color="var(--text-muted)" />}
            </div>

            {showInset && (
              <div style={{ padding: '0.5rem' }}>
                <img
                  src="/models/desert_road/candidate_b/candidate_b_vehicle_closeup_verified.png"
                  alt="Candidate B Preserved Vehicle Close-up"
                  style={{
                    width: '100%',
                    height: '110px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.3 }}>
                  Reference vehicle preserved at <code style={{ color: 'var(--accent-cyan)' }}>[0.03, 0.04, 0.45]</code> with planar road integration and zero rectangular box.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <Info size={10} />
                  <span>Camera framing only; model geometry frozen.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
