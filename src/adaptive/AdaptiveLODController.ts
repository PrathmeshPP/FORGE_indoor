import * as THREE from 'three';
import type { QualityMode } from '../types';

export interface SpatialChunkDefinition {
  chunk_id: number;
  name: string;
  bbox_min: [number, number, number];
  bbox_max: [number, number, number];
  center: [number, number, number];
  triangles_lod0: number;
  triangles_lod1: number;
  triangles_lod2: number;
  files: {
    lod0: string;
    lod1: string;
    lod2: string;
  };
}

export interface ChunkRuntimeState {
  id: number;
  name: string;
  bbox: THREE.Box3;
  center: THREE.Vector3;
  lodObjects: {
    lod0?: THREE.Object3D;
    lod1?: THREE.Object3D;
    lod2?: THREE.Object3D;
  };
  triangles: {
    lod0: number;
    lod1: number;
    lod2: number;
  };
  activeLOD: 0 | 1 | 2 | -1; // -1 = culled/hidden
  distanceToCamera: number;
  viewAngleCos: number;
  screenSpaceError: number;
  lastSwitchTime: number;
}

export class AdaptiveLODController {
  private chunks: ChunkRuntimeState[] = [];
  private qualityMode: QualityMode = 'auto';
  private frustum: THREE.Frustum = new THREE.Frustum();
  private projScreenMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private autoBudgetFactor: number = 1.0; // Dynamic scale factor adjusted by frame time

  // Minimum time between LOD switches per chunk to prevent flickering
  private readonly MIN_SWITCH_INTERVAL_MS: number = 300;

  constructor(definitions?: SpatialChunkDefinition[]) {
    if (definitions) {
      this.initFromDefinitions(definitions);
    }
  }

  public initFromDefinitions(definitions: SpatialChunkDefinition[]) {
    this.chunks = definitions.map((def) => ({
      id: def.chunk_id,
      name: def.name,
      bbox: new THREE.Box3(
        new THREE.Vector3(...def.bbox_min),
        new THREE.Vector3(...def.bbox_max)
      ),
      center: new THREE.Vector3(...def.center),
      lodObjects: {},
      triangles: {
        lod0: def.triangles_lod0,
        lod1: def.triangles_lod1,
        lod2: def.triangles_lod2,
      },
      activeLOD: 1, // Default to Balanced LOD 1
      distanceToCamera: 0,
      viewAngleCos: 1.0,
      screenSpaceError: 0,
      lastSwitchTime: 0,
    }));
  }

  public registerChunkObjects(
    chunkId: number,
    lodLevel: 0 | 1 | 2,
    object: THREE.Object3D
  ) {
    const chunk = this.chunks.find((c) => c.id === chunkId);
    if (chunk) {
      chunk.lodObjects[`lod${lodLevel}`] = object;
      object.visible = chunk.activeLOD === lodLevel;
    }
  }

  public setQualityMode(mode: QualityMode) {
    this.qualityMode = mode;
  }

  public getQualityMode(): QualityMode {
    return this.qualityMode;
  }

  /**
   * Main adaptive evaluation loop called per frame.
   */
  public update(
    camera: THREE.PerspectiveCamera,
    viewportHeight: number,
    frameTimeMs: number
  ): {
    visibleTriangles: number;
    culledTriangles: number;
    highChunks: number;
    medChunks: number;
    lowChunks: number;
    totalChunks: number;
    activeLODSummary: string;
  } {
    const now = performance.now();
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

    const camPos = camera.position;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    // Adaptive Frame Budget Controller
    // Target: 33.3 ms (30 FPS) or 16.6 ms (60 FPS)
    if (this.qualityMode === 'auto') {
      if (frameTimeMs > 32.0) {
        // High load: reduce budget factor
        this.autoBudgetFactor = Math.max(0.4, this.autoBudgetFactor - 0.05);
      } else if (frameTimeMs < 18.0) {
        // Low load / stable headroom: increase budget factor
        this.autoBudgetFactor = Math.min(1.6, this.autoBudgetFactor + 0.02);
      }
    }

    let visibleTriangles = 0;
    let culledTriangles = 0;
    let highChunks = 0;
    let medChunks = 0;
    let lowChunks = 0;

    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));

    for (const chunk of this.chunks) {
      // 1. Frustum Culling
      const inFrustum = this.frustum.intersectsBox(chunk.bbox);

      const toChunk = new THREE.Vector3().subVectors(chunk.center, camPos);
      const dist = toChunk.length();
      chunk.distanceToCamera = dist;

      toChunk.normalize();
      const cosTheta = camDir.dot(toChunk);
      chunk.viewAngleCos = cosTheta;

      // 2. Screen-Space Error (SSE)
      // SSE in pixels = (geometric_bound * viewport_height) / (2 * dist * tan(FOV/2))
      const chunkRadius = chunk.bbox.getSize(new THREE.Vector3()).length() * 0.5;
      const ssePixels = (chunkRadius * viewportHeight) / Math.max(0.1, 2.0 * dist * tanHalfFov);
      chunk.screenSpaceError = ssePixels;

      let targetLOD: 0 | 1 | 2 | -1 = 1;

      if (!inFrustum) {
        // Completely outside view frustum: cull geometry
        targetLOD = -1;
        culledTriangles += chunk.triangles.lod0;
      } else {
        // Visible inside frustum: choose LOD based on quality mode and viewing direction
        switch (this.qualityMode) {
          case 'performance':
            targetLOD = 2; // Always LOD 2 (fastest)
            break;

          case 'balanced':
            // Central visible chunk = LOD 1; distant chunk = LOD 2
            if (cosTheta > 0.4 && dist < 4.0) {
              targetLOD = 1;
            } else {
              targetLOD = 2;
            }
            break;

          case 'high':
            // Central high detail LOD 0, peripheral LOD 1
            if (cosTheta > 0.35 && dist < 4.2) {
              targetLOD = 0;
            } else {
              targetLOD = 1;
            }
            break;

          case 'maximum':
            // All chunks at max LOD 0
            targetLOD = 0;
            break;

          case 'auto':
          default: {
            // Adaptive View-Dependent Selection with Screen-Space Error & Frame Budget
            // Dynamic distance thresholds scaled by autoBudgetFactor
            const dClose = 2.8 * this.autoBudgetFactor;
            const dMid = 5.2 * this.autoBudgetFactor;

            if (cosTheta > 0.45 && dist < dClose && ssePixels > 250) {
              targetLOD = 0; // Central foreground inspection
            } else if (dist < dMid && ssePixels > 100) {
              targetLOD = 1; // Intermediate / peripheral
            } else {
              targetLOD = 2; // Far / corner overview
            }
            break;
          }
        }
      }

      // Hysteresis & switch throttling (prevent flickering near threshold boundaries)
      if (
        targetLOD !== chunk.activeLOD &&
        now - chunk.lastSwitchTime > this.MIN_SWITCH_INTERVAL_MS
      ) {
        chunk.activeLOD = targetLOD;
        chunk.lastSwitchTime = now;

        // Update Three.js object visibility
        if (chunk.lodObjects.lod0) chunk.lodObjects.lod0.visible = targetLOD === 0;
        if (chunk.lodObjects.lod1) chunk.lodObjects.lod1.visible = targetLOD === 1;
        if (chunk.lodObjects.lod2) chunk.lodObjects.lod2.visible = targetLOD === 2;
      }

      // Accumulate triangle counts
      if (chunk.activeLOD === 0) {
        visibleTriangles += chunk.triangles.lod0;
        highChunks++;
      } else if (chunk.activeLOD === 1) {
        visibleTriangles += chunk.triangles.lod1;
        medChunks++;
      } else if (chunk.activeLOD === 2) {
        visibleTriangles += chunk.triangles.lod2;
        lowChunks++;
      }
    }

    let summary = 'LOD 1 (Balanced)';
    if (highChunks > 0 && highChunks >= medChunks) summary = `LOD 0 (${highChunks} high chunks)`;
    else if (lowChunks > 0 && lowChunks > medChunks) summary = `LOD 2 (${lowChunks} low chunks)`;
    else if (medChunks > 0) summary = `LOD 1 (${medChunks} med chunks)`;

    return {
      visibleTriangles,
      culledTriangles,
      highChunks,
      medChunks,
      lowChunks,
      totalChunks: this.chunks.length,
      activeLODSummary: summary,
    };
  }

  public getChunkStates(): ChunkRuntimeState[] {
    return this.chunks;
  }
}
