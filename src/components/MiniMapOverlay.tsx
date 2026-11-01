import React, { useRef, useEffect } from 'react';
import walkthroughMetadata from '../data/indoor_walkthrough_metadata.json';

interface MiniMapOverlayProps {
  playerPos: [number, number, number];
  playerYaw: number;
  isOpen: boolean;
  onToggle: () => void;
}

export const MiniMapOverlay: React.FC<MiniMapOverlayProps> = ({
  playerPos,
  playerYaw,
  isOpen,
  onToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bounds from metadata: X in [-1.30, 1.20], Z in [-2.30, 1.50]
  const { x_min, x_max, z_min, z_max } = walkthroughMetadata.spatial_bounds;
  const roomW = x_max - x_min;
  const roomL = z_max - z_min;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Map world (X, Z) to canvas pixels
    const worldToCanvas = (x: number, z: number): [number, number] => {
      const u = (x - x_min) / roomW;
      const v = (z - z_min) / roomL;
      return [u * W, v * H];
    };

    // Draw background grid lines (unseen / unscanned space pattern)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Draw Architectural Regions
    const regions = ((walkthroughMetadata as any).architectural_regions || []) as any[];
    regions.forEach((reg: any) => {
      const [ox1, oz1, ox2, oz2] = reg.bounds;
      const [px1, py1] = worldToCanvas(ox1, oz1);
      const [px2, py2] = worldToCanvas(ox2, oz2);
      const rw = px2 - px1;
      const rh = py2 - py1;

      if (reg.type === 'walkway') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
        ctx.fillRect(px1, py1, rw, rh);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.strokeRect(px1, py1, rw, rh);
      } else if (reg.type === 'doorway') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(px1, py1, rw, rh);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(px1, py1, rw, rh);
      } else {
        // Obstacle (Bed, Desk, Wardrobe)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(px1, py1, rw, rh);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px1, py1, rw, rh);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(reg.label, px1 + 4, py1 + 12);
    });

    // Draw Video Capture Trajectory Route
    const trajectory = ((walkthroughMetadata as any).camera_trajectory || []) as any[];
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    trajectory.forEach((pt: any, idx: number) => {
      const [cx, cy] = worldToCanvas(pt.position[0], pt.position[2]);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Trajectory Keyframe Markers
    trajectory.forEach((pt, idx) => {
      const [cx, cy] = worldToCanvas(pt.position[0], pt.position[2]);
      ctx.fillStyle = idx === 0 ? '#4ade80' : idx % 10 === 0 ? '#facc15' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, idx % 10 === 0 ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player Location and Camera View Cone
    const [pX, pZ] = worldToCanvas(playerPos[0], playerPos[2]);

    // View cone (FOV ~ 60 degrees)
    const coneDist = 32;
    const fovHalf = Math.PI / 6;
    // Note: yaw = 0 looks along -Z. In canvas, +Z is down.
    // So forward angle in canvas is: yaw - Math.PI / 2
    const forwardAngle = playerYaw - Math.PI / 2;
    const a1 = forwardAngle - fovHalf;
    const a2 = forwardAngle + fovHalf;

    const coneX1 = pX + Math.cos(a1) * coneDist;
    const coneY1 = pZ + Math.sin(a1) * coneDist;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(pX, pZ);
    ctx.lineTo(coneX1, coneY1);
    ctx.arc(pX, pZ, coneDist, a1, a2);
    ctx.closePath();
    ctx.fill();

    // Player position dot
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pX, pZ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [playerPos, playerYaw, isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="minimap-toggle-btn"
        title="Open Floor Plan (M)"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 25,
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid #334155',
          borderRadius: '6px',
          color: '#38bdf8',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
        FLOOR PLAN [M]
      </button>
    );
  }

  return (
    <div
      className="minimap-panel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 25,
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        width: '240px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '6px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
          TOP-DOWN FLOOR PLAN
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px',
          }}
          title="Close (M)"
        >
          ✕
        </button>
      </div>

      <div style={{ position: 'relative', width: '216px', height: '320px', background: '#090d16', borderRadius: '4px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={216} height={320} style={{ display: 'block' }} />
      </div>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: 'rgba(34, 197, 94, 0.4)', borderRadius: '2px' }}></span>
          <span>Walkable Interior Aisle</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: 'rgba(239, 68, 68, 0.5)', borderRadius: '2px' }}></span>
          <span>Obstacles (Bed / Desk / Wardrobe)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '2px', background: '#38bdf8' }}></span>
          <span>Video Capture Trajectory (63 Cams)</span>
        </div>
      </div>
    </div>
  );
};
