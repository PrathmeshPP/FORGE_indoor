import React, { useState } from 'react';
import {
  X,
  Workflow,
  Video,
  Film,
  Camera,
  Layers,
  Box,
  Palette,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Clock,
  Gauge
} from 'lucide-react';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'problem' | 'judges_faq'>('pipeline');

  if (!isOpen) return null;

  const pipelineStages = [
    {
      num: '1',
      title: 'Monocular Source Video',
      icon: <Video size={18} color="var(--accent-cyan)" />,
      badge: 'INPUT',
      purpose: 'Uncalibrated, raw consumer video ingested without specialized multi-camera rigs or physical fiducial markers.',
      details: 'Evaluated on real drone surveys (Campus 0049 4K 60fps, River Bridge 4K 60fps) and standard dashcams (Desert Road HD 24fps, Forest Road HD 24fps).',
      evidence: 'source_inventory.json (video SHA-256 hashes, frame dimensions, framerate, duration).'
    },
    {
      num: '2',
      title: 'Keyframe Extraction & Selection',
      icon: <Film size={18} color="var(--accent-cyan)" />,
      badge: 'PRE-PROCESS',
      purpose: 'Sample optimal viewpoints based on inter-frame baseline diversity, overlap score, and sharpness.',
      details: 'Eliminates redundant stationary frames while preserving an explicit temporal association with native timestamps.',
      evidence: 'source_frames_contact_sheet.png across all 5 benchmark scenes.'
    },
    {
      num: '3',
      title: 'Depth & Camera Pose Inference',
      icon: <Camera size={18} color="var(--accent-cyan)" />,
      badge: 'FOUNDATION MODEL',
      purpose: 'Direct feed-forward inference of dense metric depth maps and 6-DoF camera poses.',
      details: 'Powered by VGGT-Ω 1B parameter geometric vision foundation model in a single forward pass (under 25s) without iterative per-scene training.',
      evidence: 'depth_confidence_preview.png (Turbo depth maps & Inferno confidence heatmaps).'
    },
    {
      num: '4',
      title: 'Point Cloud Fusion',
      icon: <Layers size={18} color="var(--accent-cyan)" />,
      badge: '3D GEOMETRY',
      purpose: 'Backproject verified depth pixels into camera coordinate rays and fuse overlapping views.',
      details: 'Hybrid KD-Tree voxel filtering removes isolated outliers and non-finite depth noise while retaining legitimate thin structures.',
      evidence: 'point_cloud_unfused.ply (raw backprojections) and point_cloud_fused.ply (fused point clouds).'
    },
    {
      num: '5',
      title: 'Surface Mesh Reconstruction',
      icon: <Box size={18} color="var(--accent-cyan)" />,
      badge: 'TOPOLOGY',
      purpose: 'Convert point clouds into watertight, continuous triangle surface meshes.',
      details: 'Screened Poisson surface reconstruction regularized with 30 Taubin smoothing iterations. Eliminates normal facets and boundary scallops with zero interior holes.',
      evidence: 'surface_mesh_repaired.ply with verified boundary loop diagnostics (0 interior holes).'
    },
    {
      num: '6',
      title: 'Photographic Texture Projection',
      icon: <Palette size={18} color="var(--accent-cyan)" />,
      badge: 'APPEARANCE',
      purpose: 'Project native photographic imagery onto the 3D surface geometry.',
      details: 'Separable raised-cosine windowing blends multi-view observations seamlessly into a unified 4096² texture atlas. Moving vehicles are segmented out (Cand A) or isolated via GrabCut (Cand B).',
      evidence: 'surface_mesh_photographic.ply (vertex colors), textured_mesh.obj + .mtl, and texture_atlas.png.'
    },
    {
      num: '7',
      title: 'Interactive Viewer & Validation',
      icon: <CheckCircle2 size={18} color="var(--accent-emerald)" />,
      badge: 'PLATFORM',
      purpose: 'Hardware-accelerated WebGL inspection, A/B candidate comparison, and interoperable bundle export.',
      details: 'F.O.R.G.E Explorer platform with Three.js r186, synchronized dual-viewports, bounding box inspection, and direct ZIP bundle download.',
      evidence: 'outputs/accuracy_experiment/sprint9_video_to_viewer_release/ (103 verified release files).'
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '880px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Workflow size={20} color="var(--accent-cyan)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                F.O.R.G.E Engineering Workflow & Architecture
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Feed-Forward Monocular Video-to-3D Reconstruction Pipeline
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.4)' }}>
          <button
            className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '0.65rem 1.2rem',
              border: 'none',
              background: activeTab === 'pipeline' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'pipeline' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'pipeline' ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            7-Stage Pipeline
          </button>
          <button
            className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`}
            onClick={() => setActiveTab('problem')}
            style={{
              padding: '0.65rem 1.2rem',
              border: 'none',
              background: activeTab === 'problem' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'problem' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'problem' ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            Problem Solved & Advantages
          </button>
          <button
            className={`tab-btn ${activeTab === 'judges_faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('judges_faq')}
            style={{
              padding: '0.65rem 1.2rem',
              border: 'none',
              background: activeTab === 'judges_faq' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'judges_faq' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'judges_faq' ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            Faculty & Judge Methodology FAQ
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.2rem' }}>
          {activeTab === 'pipeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                F.O.R.G.E converts everyday monocular video into 3D models using a verified feed-forward pipeline.
                Below is the traceable progression from raw frames to interactive 3D assets:
              </div>

              {pipelineStages.map((stage) => (
                <div
                  key={stage.num}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--accent-cyan)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {stage.num}
                      </span>
                      {stage.icon}
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                        {stage.title}
                      </span>
                    </div>
                    <span className="badge metric" style={{ fontSize: '0.68rem' }}>
                      {stage.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.2rem' }}>
                    {stage.purpose}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {stage.details}
                  </div>

                  <div
                    style={{
                      marginTop: '0.2rem',
                      padding: '0.35rem 0.6rem',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      color: 'var(--accent-cyan)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    Release Artifact: {stage.evidence}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'problem' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem', lineHeight: 1.55 }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={18} color="var(--accent-cyan)" />
                  The Problem F.O.R.G.E Solves
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Traditional 3D reconstruction from video requires either:
                </p>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  <li><strong>Structure-from-Motion (COLMAP):</strong> Fragile feature matching that fails in low-texture regions (asphalt, water, sky) and takes tens of minutes to hours.</li>
                  <li><strong>NeRFs & 3D Gaussian Splatting:</strong> Require dense per-scene iterative gradient optimization (10–30 minutes GPU time per video) and produce non-standard volumetric representations not readily usable in CAD or standard GIS software.</li>
                </ul>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <Clock size={16} />
                    <span>Feed-Forward Speed</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    F.O.R.G.E infers depth and camera trajectories in a single forward pass (under 45s total pipeline time on an RTX 2070 SUPER), delivering real-time photogrammetric turnaround.
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <Box size={16} />
                    <span>Standard Mesh Outputs</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Generates industry-standard OBJ+MTL textured packages and colored PLYs directly compatible with Blender, Unreal Engine, WebGL, Unity, and CloudCompare.
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <Gauge size={16} />
                    <span>Dynamic Object Handling</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Demonstrates both static corridor cleaning (Candidate A) and shape-aware instance vehicle preservation (Candidate B) without rectangular road artifacts.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'judges_faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.82rem', lineHeight: 1.55 }}>
              <div className="alert-box info" style={{ marginBottom: '0.2rem' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Academic & Industry Transparency Disclosure</div>
                  <div style={{ fontSize: '0.75rem' }}>
                    F.O.R.G.E operates on model-relative coordinate systems. Monocular vision produces structurally accurate geometry but does not guarantee absolute physical scale without a known baseline or ground control targets.
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  Q1: How are camera poses and depth maps estimated from monocular video?
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  A: The pipeline uses the VGGT-Ω 1B vision transformer foundation model. Trained on large-scale multi-view datasets, it simultaneously infers per-frame relative depth distributions and 6-DoF camera extrinsics $[R | t]$ from cross-attention between tokenized image patches.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  Q2: Why does Campus 0049 have a Conditional PARTIAL status?
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  A: Physical telemetry confirms the drone was hovering virtually in place (under 0.10 m translation across 16 seconds). With near-zero horizontal baseline, stereo triangulation of vertical building facades behind roof overhangs is mathematically ill-posed. Rather than hallucinating unseen geometry, F.O.R.G.E honestly preserves the observed terrain and roofs while disclosing the limitation.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  Q3: How were the rectangular road artifacts in Desert Road resolved?
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  A: Earlier sprints used a naive bounding-box patch that projected a box-shaped step onto the road plane. Sprint 9/10 employs pixel-accurate GrabCut instance segmentation + contact shadow masking on Frame 0, while multi-view observations from frames 1..7 reconstruct the underlying asphalt with continuous planar curvature.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  Q4: How does texture projection handle multi-camera seamlines?
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  A: A separable raised-cosine windowing function feathers each camera's border contribution (270px bottom, 200px margins) combined with camera gain harmonization, eliminating the diagonal crease artifacts seen in standard fronto-parallel texturing.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
