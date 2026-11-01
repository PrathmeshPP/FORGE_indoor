import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Info,
  Maximize2,
  HardDrive,
  Hash,
} from 'lucide-react';
import JSZip from 'jszip';
import type { SceneEntry, RepresentationType, BoundingBoxInfo, ActiveGeometryStats } from '../types';
import { GeometryStatsDisplay } from './GeometryStatsDisplay';

interface InspectionPanelProps {
  scene: SceneEntry;
  currentRepresentation: RepresentationType;
  boundingBox: BoundingBoxInfo | null;
  activeStats?: ActiveGeometryStats | null;
}

export const InspectionPanel: React.FC<InspectionPanelProps> = ({
  scene,
  currentRepresentation,
  boundingBox,
  activeStats,
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const rep =
    scene.representations[currentRepresentation] ||
    scene.representations.gltf_glb ||
    scene.representations.textured_obj ||
    scene.representations.photographic_ply ||
    Object.values(scene.representations)[0];

  const handleCopyHash = () => {
    if (rep?.sha256) {
      navigator.clipboard.writeText(rep.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'N/A';
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Derive stats if not yet dispatched by viewport
  const currentFileName =
    rep?.type === 'obj'
      ? rep.obj_url?.split('/').pop() || 'textured_mesh.obj'
      : rep?.type === 'glb'
        ? rep.glb_url?.split('/').pop() || 'model.glb'
        : rep?.ply_url?.split('/').pop() || 'surface_mesh.ply';

  const effectiveStats: ActiveGeometryStats = activeStats || {
    uniqueVertices: scene.vertex_count,
    renderedPositions:
      rep?.type === 'obj' ? scene.triangle_count * 3 : scene.vertex_count,
    triangles: scene.triangle_count,
    sourceFileName: currentFileName,
    format: rep?.type === 'obj' ? 'OBJ' : rep?.type === 'glb' ? 'GLB' : 'PLY',
  };

  // Export & Download asset bundle
  const handleDownloadAsset = async () => {
    try {
      setIsExporting(true);
      setExportProgress('Preparing bundle...');

      if (rep.type === 'obj' && rep.obj_url && rep.mtl_url && rep.texture_urls) {
        setExportProgress('Fetching OBJ geometry...');
        const zip = new JSZip();

        // 1. Fetch OBJ
        const objResp = await fetch(rep.obj_url);
        if (!objResp.ok) throw new Error('Failed to fetch OBJ geometry');
        const objBlob = await objResp.blob();
        const objFileName = rep.obj_url.split('/').pop() || 'model.obj';
        zip.file(objFileName, objBlob);

        // 2. Fetch MTL
        setExportProgress('Fetching MTL material...');
        const mtlResp = await fetch(rep.mtl_url);
        if (!mtlResp.ok) throw new Error('Failed to fetch MTL material');
        const mtlBlob = await mtlResp.blob();
        const mtlFileName = rep.mtl_url.split('/').pop() || 'model.mtl';
        zip.file(mtlFileName, mtlBlob);

        // 3. Fetch Texture Atlas
        setExportProgress('Fetching Texture Atlas...');
        for (const texUrl of rep.texture_urls) {
          const texResp = await fetch(texUrl);
          if (texResp.ok) {
            const texBlob = await texResp.blob();
            const texFileName = texUrl.split('/').pop() || 'texture_atlas.png';
            zip.file(texFileName, texBlob);
          }
        }

        // 4. Add Readme & Metadata
        setExportProgress('Generating bundle package...');
        const bundleInfo = {
          forge_release: 'Sprint 10.1 Presentation & Provenance Release',
          reconstruction_run_id: scene.reconstruction_run_id || 'sprint9_video_to_viewer_release',
          scene_id: scene.id,
          display_name: scene.display_name,
          source_asset: currentFileName,
          sha256: rep.sha256,
          exported_at: new Date().toISOString(),
          coordinate_notice: scene.coordinate_status,
          known_limitations: scene.known_limitations,
        };
        zip.file('BUNDLE_PROVENANCE.json', JSON.stringify(bundleInfo, null, 2));

        // Generate Zip
        const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
          setExportProgress(`Compressing (${Math.round(metadata.percent)}%)...`);
        });

        // Trigger Browser Download
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${scene.id}_textured_bundle.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } else if (rep.type === 'ply' && rep.ply_url) {
        setExportProgress('Fetching PLY file...');
        const plyResp = await fetch(rep.ply_url);
        if (!plyResp.ok) throw new Error('Failed to fetch PLY file');
        const plyBlob = await plyResp.blob();
        const plyFileName = rep.ply_url.split('/').pop() || `${scene.id}.ply`;

        const downloadUrl = URL.createObjectURL(plyBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = plyFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
      setExportProgress('Download ready!');
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
      }, 1500);
    } catch (err: any) {
      console.error('Export error:', err);
      setExportProgress(`Export failed: ${err.message || 'Network error'}`);
      setTimeout(() => setIsExporting(false), 3000);
    }
  };

  return (
    <aside className="inspector-panel">
      <div className="panel-header">
        <div className="panel-title">
          <FileText size={16} />
          <span>Inspection & Provenance</span>
        </div>
      </div>

      <div className="inspector-content">
        {/* Model Identification Card */}
        <div className="inspector-card">
          <div className="card-heading">
            <span>Model Identity</span>
            <span
              className={`badge ${scene.acceptance_status === 'PASS' ? 'pass' : 'partial'
                }`}
            >
              {scene.acceptance_status}
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
            {scene.display_name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {scene.description}
          </div>

          <div className="stat-grid" style={{ marginTop: '0.4rem' }}>
            <div className="stat-item">
              <span className="stat-label">Active Format</span>
              <span className="stat-val" style={{ color: 'var(--accent-cyan)' }}>
                {rep?.type ? rep.type.toUpperCase() : 'GLB'} ({currentRepresentation.replace('_', ' ')})
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">File Size</span>
              <span className="stat-val">{formatFileSize(rep?.file_size_bytes || 0)}</span>
            </div>
          </div>
        </div>

        {/* Standardized Active Geometry & Asset Statistics Card */}
        <GeometryStatsDisplay stats={effectiveStats} mode="inspector" />

        {/* Cryptographic Hash Card */}
        <div className="inspector-card">
          <div className="card-heading">
            <span>Verified SHA-256 Digest</span>
            <button
              className="btn-icon"
              style={{ width: '24px', height: '24px' }}
              onClick={handleCopyHash}
              title="Copy verified SHA-256 hash to clipboard"
            >
              {copiedHash ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            </button>
          </div>
          <div className="hash-container">
            <Hash size={14} color="var(--accent-cyan)" />
            <span className="hash-text" title={rep.sha256}>
              {rep.sha256}
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Asset: <code>{currentFileName}</code> (Sprint 9 Release Baseline).
          </div>
        </div>

        {/* Bounding Box Dimensions */}
        <div className="inspector-card">
          <div className="card-heading">
            <span>Bounding Box & Coordinates</span>
            <Maximize2 size={13} color="var(--text-muted)" />
          </div>

          {boundingBox ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">Span X (Width)</span>
                  <span className="stat-val">{boundingBox.size[0].toFixed(3)} u</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Span Y (Height)</span>
                  <span className="stat-val">{boundingBox.size[1].toFixed(3)} u</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Span Z (Depth / Length)</span>
                <span className="stat-val">{boundingBox.size[2].toFixed(3)} u</span>
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                }}
              >
                X: [{boundingBox.min[0].toFixed(2)}, {boundingBox.max[0].toFixed(2)}] |
                Y: [{boundingBox.min[1].toFixed(2)}, {boundingBox.max[1].toFixed(2)}] |
                Z: [{boundingBox.min[2].toFixed(2)}, {boundingBox.max[2].toFixed(2)}]
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Calculating bounding box dimensions...
            </div>
          )}
        </div>

        {/* Coordinate System & Scale Notice */}
        <div className="alert-box info">
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Coordinate Scale Status</div>
            <div>{scene.coordinate_status}</div>
          </div>
        </div>

        {/* Known Limitations */}
        {scene.acceptance_status !== 'PASS' && (
          <div className="alert-box">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>Known Limitation Notice</div>
              <div>{scene.known_limitations}</div>
            </div>
          </div>
        )}

        {/* Export & Download Card */}
        <div className="inspector-card">
          <div className="card-heading">
            <span>Asset Bundle Export</span>
            <HardDrive size={13} color="var(--text-muted)" />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {rep?.type === 'obj'
              ? 'Download complete textured package (OBJ + MTL + PNG Texture Atlas) ready for Blender, Unreal Engine, or WebGL.'
              : rep?.type === 'glb'
                ? 'Download standalone Binary glTF (GLB) mesh with embedded geometry and vertex colors.'
                : 'Download original unnormalized Polygon File Format (PLY) mesh with original vertex coordinates.'}
          </div>

          <button
            className="btn-action primary"
            onClick={handleDownloadAsset}
            disabled={isExporting}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
          >
            <Download size={15} />
            <span>
              {isExporting
                ? exportProgress || 'Exporting...'
                : rep?.type === 'obj'
                  ? 'Download Textured Bundle (.zip)'
                  : rep?.type === 'glb'
                    ? 'Download Standalone GLB (.glb)'
                    : 'Download Original PLY (.ply)'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
