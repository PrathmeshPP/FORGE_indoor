import React from 'react';
import { Layers, Columns } from 'lucide-react';
import type { SceneEntry } from '../types';

interface SceneLibraryProps {
  scenes: SceneEntry[];
  selectedSceneId: string;
  onSelectScene: (scene: SceneEntry) => void;
  onStartComparison: () => void;
}

export const SceneLibrary: React.FC<SceneLibraryProps> = ({
  scenes,
  selectedSceneId,
  onSelectScene,
  onStartComparison,
}) => {
  return (
    <aside className="scene-library-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={16} />
          <span>Scene Library ({scenes.length})</span>
        </div>
      </div>

      <div className="scene-list">
        {scenes.map((scene) => {
          const isSelected = scene.id === selectedSceneId;
          return (
            <div
              key={scene.id}
              className={`scene-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectScene(scene)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectScene(scene);
                }
              }}
            >
              <div className="scene-card-top">
                <div className="scene-thumb-container">
                  <img
                    src={scene.thumbnail_url}
                    alt={scene.display_name}
                    className="scene-thumb-img"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="scene-meta-brief">
                  <div className="scene-meta-title">{scene.display_name}</div>
                  <div className="scene-meta-sub">{scene.subtitle}</div>
                  <div className="scene-card-tags">
                    <span
                      className={`badge ${
                        scene.acceptance_status === 'PASS' ? 'pass' : 'partial'
                      }`}
                    >
                      {scene.acceptance_status}
                    </span>
                    <span className="badge metric">
                      {(scene.vertex_count / 1000).toFixed(0)}k v
                    </span>
                    <span className="badge metric">
                      {(scene.triangle_count / 1000).toFixed(0)}k f
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="quick-compare-box">
        <button
          className="btn-action primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onStartComparison}
        >
          <Columns size={16} />
          <span>Compare Desert Road A vs B</span>
        </button>
      </div>
    </aside>
  );
};
