import React, { useState, useEffect } from 'react';
import manifestData from './data/model-manifest.json';
import type {
  ModelManifest,
  SceneEntry,
  RepresentationType,
  ViewportConfig,
  BoundingBoxInfo,
  ActiveGeometryStats,
  CameraPresetAction,
  CameraPresetType,
} from './types';
import { Header } from './components/Header';
import { SceneLibrary } from './components/SceneLibrary';
import { Viewport3D } from './components/Viewport3D';
import { ComparisonView } from './components/ComparisonView';
import { InspectionPanel } from './components/InspectionPanel';
import { Toolbar } from './components/Toolbar';
import { HelpModal } from './components/HelpModal';
import { WorkflowModal } from './components/WorkflowModal';

export const App: React.FC = () => {
  const manifest = manifestData as unknown as ModelManifest;
  const scenes = manifest.scenes;

  // Parse URL parameter ?scene=...
  const initialScene = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sceneParam = params.get('scene');
      if (sceneParam) {
        const found = scenes.find((s) => s.id === sceneParam);
        if (found) return found;
      }
    } catch (_) { }
    return scenes[0];
  })();

  // App State
  const [activeScene, setActiveScene] = useState<SceneEntry>(initialScene);
  const [representation, setRepresentation] = useState<RepresentationType>(initialScene.default_representation || 'gltf_glb');
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<BoundingBoxInfo | null>(null);
  const [activeStats, setActiveStats] = useState<ActiveGeometryStats | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWalkthroughMode, setIsWalkthroughMode] = useState<boolean>(false);

  const [viewportConfig, setViewportConfig] = useState<ViewportConfig>({
    showGrid: true,
    showAxes: false,
    wireframe: false,
    background: 'slate',
    autoRotate: false,
  });

  // Desert Road candidates for comparison
  const candA = scenes.find((s) => s.id === 'desert_road_candidate_a') || scenes[1];
  const candB = scenes.find((s) => s.id === 'desert_road_candidate_b') || scenes[2];

  // Select scene handler
  const handleSelectScene = (scene: SceneEntry) => {
    setActiveScene(scene);
    setActiveStats(null);
    setIsComparisonMode(false);
    setRepresentation(scene.default_representation || 'textured_obj');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('scene', scene.id);
      window.history.replaceState(null, '', url.toString());
    } catch (_) {}
  };

  // Toggle comparison mode
  const handleToggleComparison = () => {
    if (!isComparisonMode) {
      setIsComparisonMode(true);
      setActiveScene(candA);
    } else {
      setIsComparisonMode(false);
    }
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Update viewport config partial
  const handleUpdateConfig = (newCfg: Partial<ViewportConfig>) => {
    setViewportConfig((prev) => ({ ...prev, ...newCfg }));
  };

  // Camera preset action trigger
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState<CameraPresetAction>({
    type: 'reset',
    nonce: 0,
  });

  const handleViewPreset = (preset: CameraPresetType) => {
    setCameraPresetTrigger({ type: preset, nonce: Date.now() });
  };

  const handleResetCamera = () => {
    setCameraPresetTrigger({ type: 'reset', nonce: Date.now() });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore global shortcut keys when in first-person walkthrough mode
      if (isWalkthroughMode) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      switch (e.key) {
        case '1':
          handleViewPreset('top');
          break;
        case '2':
          handleViewPreset('front');
          break;
        case '3':
          handleViewPreset('side');
          break;
        case '4':
          handleViewPreset('iso');
          break;
        case '5':
          // Contextual preset
          if (activeScene.id === 'campus_0049') handleViewPreset('facade');
          else if (activeScene.id === 'forest_road') handleViewPreset('roadway');
          else if (activeScene.id === 'river_bridge') handleViewPreset('bridge_structure');
          else if (activeScene.id === 'desert_road_candidate_b') handleViewPreset('vehicle_focus');
          else handleViewPreset('overview');
          break;
        case 'r':
        case 'R':
          handleResetCamera();
          break;
        case 'w':
          handleUpdateConfig({ wireframe: !viewportConfig.wireframe });
          break;
        case 'g':
          handleUpdateConfig({ showGrid: !viewportConfig.showGrid });
          break;
        case 'c':
        case 'C':
          handleToggleComparison();
          break;
        case 'p':
        case 'P':
          setIsWorkflowOpen((prev) => !prev);
          break;
        case '?':
          setIsHelpOpen((prev) => !prev);
          break;
        case 'Escape':
          setIsHelpOpen(false);
          setIsWorkflowOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComparisonMode, activeScene, viewportConfig, isWalkthroughMode]);

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        activeScene={activeScene}
        isLoading={isLoading}
        loadProgress={loadProgress}
        isComparisonMode={isComparisonMode}
        onToggleComparison={handleToggleComparison}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenWorkflow={() => setIsWorkflowOpen(true)}
      />

      {/* Main 3-Column Layout */}
      <div className="main-layout">
        {/* Left: Scene Library */}
        <SceneLibrary
          scenes={scenes}
          selectedSceneId={isComparisonMode ? 'desert_road_candidate_a' : activeScene.id}
          onSelectScene={handleSelectScene}
          onStartComparison={() => {
            setIsComparisonMode(true);
            setActiveScene(candA);
          }}
        />

        {/* Center: 3D Viewport Area */}
        <div className="viewport-area">
          {isComparisonMode ? (
            <ComparisonView
              sceneA={candA}
              sceneB={candB}
              representation={representation}
              config={viewportConfig}
              onLoadingChange={(loading, pct) => {
                setIsLoading(loading);
                setLoadProgress(pct);
              }}
              onBoundingBoxChange={setBoundingBox}
              presetAction={cameraPresetTrigger}
            />
          ) : (
            <Viewport3D
              key={`${activeScene.id}-${representation}`}
              scene={activeScene}
              representation={representation}
              config={viewportConfig}
              onLoadingChange={(loading, pct) => {
                setIsLoading(loading);
                setLoadProgress(pct);
              }}
              onBoundingBoxChange={setBoundingBox}
              onStatsChange={setActiveStats}
              onFallbackToPly={() => setRepresentation('photographic_ply')}
              presetAction={cameraPresetTrigger}
              onSelectRepresentation={setRepresentation}
              isWalkthroughMode={isWalkthroughMode}
              onToggleWalkthrough={setIsWalkthroughMode}
            />
          )}

          {/* Viewport Docked Toolbar */}
          <Toolbar
            scene={activeScene}
            currentRepresentation={representation}
            onSelectRepresentation={(rep) => {
              setActiveStats(null);
              setRepresentation(rep);
            }}
            config={viewportConfig}
            onUpdateConfig={handleUpdateConfig}
            onViewPreset={handleViewPreset}
            onResetCamera={handleResetCamera}
          />
        </div>

        {/* Right: Inspection & Metadata Panel */}
        <InspectionPanel
          scene={activeScene}
          currentRepresentation={representation}
          boundingBox={boundingBox}
          activeStats={activeStats}
        />
      </div>

      {/* Controls Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Engineering Workflow Modal */}
      <WorkflowModal isOpen={isWorkflowOpen} onClose={() => setIsWorkflowOpen(false)} />
    </div>
  );
};

export default App;
