import React from 'react';
import {
  Grid,
  Compass,
  Square,
  RotateCcw,
  Eye,
  Crosshair,
  MapPin,
  Building,
  Trees,
} from 'lucide-react';
import type {
  SceneEntry,
  RepresentationType,
  ViewportConfig,
  BackgroundTheme,
  CameraPresetType,
} from '../types';

interface ToolbarProps {
  scene: SceneEntry;
  currentRepresentation: RepresentationType;
  onSelectRepresentation: (rep: RepresentationType) => void;
  config: ViewportConfig;
  onUpdateConfig: (newConfig: Partial<ViewportConfig>) => void;
  onViewPreset: (preset: CameraPresetType) => void;
  onResetCamera: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  scene,
  currentRepresentation,
  onSelectRepresentation,
  config,
  onUpdateConfig,
  onViewPreset,
  onResetCamera,
}) => {
  const bgThemes: { key: BackgroundTheme; label: string }[] = [
    { key: 'slate', label: 'Dark Slate' },
    { key: 'black', label: 'Pitch Black' },
    { key: 'charcoal', label: 'Charcoal' },
    { key: 'light', label: 'Light Studio' },
  ];

  return (
    <div className="viewport-toolbar">
      {/* Representation Selector Group */}
      <div className="toolbar-group">
        {(Object.keys(scene.representations) as RepresentationType[]).map((repKey) => {
          const rep = scene.representations[repKey];
          if (!rep || !rep.available) return null;
          const isActive = currentRepresentation === repKey;
          return (
            <button
              key={repKey}
              className={`btn-action ${isActive ? 'primary' : ''}`}
              onClick={() => onSelectRepresentation(repKey)}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              title={`Switch representation to ${rep.label}`}
            >
              <Eye size={13} />
              <span>
                {repKey === 'textured_obj'
                  ? 'Textured OBJ'
                  : repKey === 'photographic_ply'
                  ? 'Photo PLY'
                  : repKey === 'gltf_glb'
                  ? 'Interactive GLB'
                  : 'Raw Mesh'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="toolbar-separator" />

      {/* Standard Camera View Presets */}
      <div className="toolbar-group">
        <button
          className="btn-action"
          onClick={() => onViewPreset('top')}
          style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
          title="Top Overhead View"
        >
          Top
        </button>
        <button
          className="btn-action"
          onClick={() => onViewPreset('front')}
          style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
          title="Front Elevation View"
        >
          Front
        </button>
        <button
          className="btn-action"
          onClick={() => onViewPreset('side')}
          style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
          title="Side Profile View"
        >
          Side
        </button>
        <button
          className="btn-action"
          onClick={() => onViewPreset('iso')}
          style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
          title="Isometric Perspective View"
        >
          Iso
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Scene-Specific Dedicated Inspection Presets */}
      <div className="toolbar-group">
        {scene.id === 'campus_0049' && (
          <>
            <button
              className="btn-action"
              onClick={() => onViewPreset('overview')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
              title="Overview of Campus grounds and roofs"
            >
              Overview
            </button>
            <button
              className="btn-action"
              onClick={() => onViewPreset('facade')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', color: 'var(--accent-cyan)' }}
              title="Dedicated Facade Inspection View (Observes true drone hover limits)"
            >
              <Building size={13} />
              <span>Facade View</span>
            </button>
          </>
        )}

        {scene.id === 'desert_road_candidate_a' && (
          <button
            className="btn-action"
            onClick={() => onViewPreset('full_road')}
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', color: 'var(--accent-cyan)' }}
            title="Clean Static Highway Corridor Overview"
          >
            <MapPin size={13} />
            <span>Corridor View</span>
          </button>
        )}

        {scene.id === 'desert_road_candidate_b' && (
          <>
            <button
              className="btn-action primary"
              onClick={() => onViewPreset('vehicle_focus')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              title="Focus Camera directly on preserved Mini Cooper at [0.03, 0.04, 0.45]"
            >
              <Crosshair size={13} />
              <span>Focus Vehicle</span>
            </button>
            <button
              className="btn-action"
              onClick={() => onViewPreset('full_road')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
              title="Return to full highway corridor view"
            >
              Full Road
            </button>
          </>
        )}

        {scene.id === 'forest_road' && (
          <>
            <button
              className="btn-action"
              onClick={() => onViewPreset('overview')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
              title="Aerial Canopy and Mountain Valley Overview"
            >
              <Trees size={13} />
              <span>Canopy View</span>
            </button>
            <button
              className="btn-action"
              onClick={() => onViewPreset('roadway')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', color: 'var(--accent-cyan)' }}
              title="Roadway Corridor View: Double yellow lines and continuous asphalt"
            >
              <MapPin size={13} />
              <span>Roadway View</span>
            </button>
          </>
        )}

        {scene.id === 'river_bridge' && (
          <>
            <button
              className="btn-action"
              onClick={() => onViewPreset('bridge_structure')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem', color: 'var(--accent-cyan)' }}
              title="Dedicated Structural View: Bridge deck, guard railings, piers & riverbed"
            >
              <Building size={13} />
              <span>Bridge Structure</span>
            </button>
            <button
              className="btn-action"
              onClick={() => onViewPreset('overview')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
              title="River valley and channel overview"
            >
              Valley View
            </button>
          </>
        )}

        <button
          className="btn-icon"
          onClick={onResetCamera}
          title="Reset Camera & Center Model"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Visual Helpers Toggles */}
      <div className="toolbar-group">
        <button
          className={`btn-icon ${config.wireframe ? 'active' : ''}`}
          onClick={() => onUpdateConfig({ wireframe: !config.wireframe })}
          title="Toggle Wireframe Overlay"
        >
          <Square size={15} />
        </button>
        <button
          className={`btn-icon ${config.showGrid ? 'active' : ''}`}
          onClick={() => onUpdateConfig({ showGrid: !config.showGrid })}
          title="Toggle Ground Grid"
        >
          <Grid size={15} />
        </button>
        <button
          className={`btn-icon ${config.showAxes ? 'active' : ''}`}
          onClick={() => onUpdateConfig({ showAxes: !config.showAxes })}
          title="Toggle Coordinate Axes"
        >
          <Compass size={15} />
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Background Theme Selector */}
      <div className="toolbar-group" style={{ position: 'relative' }}>
        <select
          value={config.background}
          onChange={(e) => onUpdateConfig({ background: e.target.value as BackgroundTheme })}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.3rem 0.5rem',
            fontSize: '0.72rem',
            cursor: 'pointer',
            outline: 'none',
          }}
          title="Viewport Background Color"
        >
          {bgThemes.map((t) => (
            <option key={t.key} value={t.key} style={{ background: '#1e293b', color: '#fff' }}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
