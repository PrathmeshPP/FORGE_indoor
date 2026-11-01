export type RepresentationType =
  | 'textured_obj'
  | 'photographic_ply'
  | 'untextured_ply'
  | 'gltf_glb'
  | 'lod0'
  | 'lod1'
  | 'lod2'
  | 'adaptive_chunks';

export interface ModelRepresentation {
  type: 'obj' | 'ply' | 'glb' | 'adaptive_chunks';
  label: string;
  obj_url?: string;
  mtl_url?: string;
  texture_urls?: string[];
  ply_url?: string;
  glb_url?: string;
  chunks_url?: string;
  file_size_bytes: number;
  sha256: string;
  available: boolean;
}

export type CameraPresetType =
  | 'top'
  | 'front'
  | 'side'
  | 'iso'
  | 'reset'
  | 'overview'
  | 'facade'
  | 'roadway'
  | 'bridge_structure'
  | 'vehicle_focus'
  | 'full_road';

export interface CameraPresetAction {
  type: CameraPresetType;
  nonce: number;
}

export interface ActiveGeometryStats {
  uniqueVertices: number | null;
  renderedPositions: number | null;
  triangles: number | null;
  sourceFileName: string | null;
  format: 'OBJ' | 'PLY' | 'GLB' | 'UNKNOWN';
}

export interface CameraPresetDefinition {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface SceneEntry {
  id: string;
  scene_name: string;
  candidate_key?: string;
  display_name: string;
  subtitle: string;
  category: string;
  acceptance_status: 'PASS' | 'PARTIAL' | 'FAIL';
  acceptance_label: string;
  description: string;
  known_limitations: string;
  coordinate_status: string;
  vertex_count: number;
  triangle_count: number;
  default_representation: RepresentationType;
  representations: Record<RepresentationType, ModelRepresentation>;
  thumbnail_url: string;
  previews: Record<string, string>;
  metadata_url: string;
  initial_camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  camera_presets?: CameraPresetDefinition[];
  reconstruction_run_id?: string;
}

export interface ComparisonPair {
  id: string;
  label: string;
  left_id: string;
  right_id: string;
  focus_feature: string;
  comparison_notes: string;
}

export interface ModelManifest {
  app_title: string;
  version: string;
  sprint: string;
  description: string;
  baseline_freeze: string;
  scenes: SceneEntry[];
  comparison_pairs: ComparisonPair[];
}

export type BackgroundTheme = 'slate' | 'black' | 'charcoal' | 'light';

export interface ViewportConfig {
  showGrid: boolean;
  showAxes: boolean;
  wireframe: boolean;
  background: BackgroundTheme;
  autoRotate: boolean;
}

export interface BoundingBoxInfo {
  min: [number, number, number];
  max: [number, number, number];
  size: [number, number, number];
  center: [number, number, number];
}

export type QualityMode = 'auto' | 'performance' | 'balanced' | 'high' | 'maximum';

export interface PerformanceHUDStats {
  fps: number;
  fpsLow: number;
  cpuMs: number;
  gpuMs: number;
  resolution: string;
  dpr: number;
  qualityMode: QualityMode;
  visibleTriangles: number;
  culledTriangles: number;
  drawCalls: number;
  highDetailChunks: number;
  mediumDetailChunks: number;
  lowDetailChunks: number;
  totalChunks: number;
  activeLOD: string;
  gpuMemoryMb: number;
}
