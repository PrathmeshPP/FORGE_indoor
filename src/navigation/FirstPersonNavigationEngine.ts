/**
 * F.O.R.G.E. - Universal First-Person Navigation & Collision Engine
 * 
 * Implements:
 * 1. PointerLock mouse-controlled camera (pitch & yaw with vertical clamping).
 * 2. WASD movement with Shift sprinting and smooth acceleration.
 * 3. Space for upward movement, C for downward movement across ALL scenes.
 * 4. O key to toggle between Walk Mode (floor-aligned) and Fly Mode (free 3D navigation).
 * 5. Dynamic scale-aware collision and bounding box adaptation.
 * 6. Protection against page scrolling (preventDefault on Space) and input field conflicts.
 * 7. Window blur safety resets so the camera never drifts.
 */

import * as THREE from 'three';
import walkthroughMetadata from '../data/indoor_walkthrough_metadata.json';

export interface TrajectoryPoint {
  index: number;
  position: [number, number, number];
  forward: [number, number, number];
  timestamp_sec: number;
  frame_url: string;
  filename: string;
}

export interface ArchitecturalRegion {
  id: string;
  name: string;
  type: string;
  bounds: [number, number, number, number]; // [x_min, z_min, x_max, z_max]
  height_range: [number, number];
  label: string;
}

export interface NavigationCallbacks {
  onPositionUpdate?: (pos: THREE.Vector3, yaw: number) => void;
  onClosestFrameChange?: (frame: TrajectoryPoint, distance: number) => void;
  onCollisionStatus?: (status: 'CLEAR' | 'SLIDING' | 'BOUNDARY') => void;
  onExitRequest?: () => void;
  onToggleMiniMap?: () => void;
  onTogglePointCloud?: () => void;
  onModeChange?: (mode: 'WALK' | 'FLY') => void;
}

export class FirstPersonNavigationEngine {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private callbacks: NavigationCallbacks;

  // Player physics state
  private position: THREE.Vector3;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private yaw: number = 0;
  private pitch: number = 0;
  private isPointerLocked: boolean = false;
  private isSprinting: boolean = false;
  private isFlyMode: boolean = false;

  private moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  // Config parameters
  private playerRadius = 0.20;
  private eyeHeight = 1.42;
  private floorY = 0.0;
  private walkSpeed = 1.40;
  private sprintSpeed = 2.60;
  private verticalSpeed = 1.30;
  private mouseSensitivity = 0.0022;

  // Spatial boundaries
  private xMin = -15.0;
  private xMax = 15.0;
  private yMin = -5.0;
  private yMax = 25.0;
  private zMin = -15.0;
  private zMax = 15.0;

  private regions: ArchitecturalRegion[] = ((walkthroughMetadata as any).architectural_regions || []) as ArchitecturalRegion[];
  private trajectory: TrajectoryPoint[] = ((walkthroughMetadata as any).camera_trajectory || []) as TrajectoryPoint[];
  private lastClosestIndex: number = -1;

  // Bound event listeners
  private onKeyDownBound = this.onKeyDown.bind(this);
  private onKeyUpBound = this.onKeyUp.bind(this);
  private onMouseMoveBound = this.onMouseMove.bind(this);
  private onPointerLockChangeBound = this.onPointerLockChange.bind(this);
  private onBlurBound = this.onBlur.bind(this);
  private onWheelBound = this.onWheel.bind(this);

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    callbacks: NavigationCallbacks = {},
    sceneId?: string,
    modelBoundingBox?: THREE.Box3 | null
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    // Adapt bounds & speeds dynamically based on model bounding box or scene config
    if (modelBoundingBox && !modelBoundingBox.isEmpty()) {
      const size = modelBoundingBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 2.0);
      const padding = Math.max(2.0, maxDim * 0.35);

      this.xMin = modelBoundingBox.min.x - padding;
      this.xMax = modelBoundingBox.max.x + padding;
      this.yMin = modelBoundingBox.min.y - 1.0;
      this.yMax = modelBoundingBox.max.y + padding;
      this.zMin = modelBoundingBox.min.z - padding;
      this.zMax = modelBoundingBox.max.z + padding;
      this.floorY = modelBoundingBox.min.y;

      // Scale movement speed for massive outdoor environments (Campus, Roads) vs rooms
      const speedScale = Math.max(1.0, Math.min(8.0, maxDim / 6.0));
      this.walkSpeed = 1.30 * speedScale;
      this.sprintSpeed = 2.60 * speedScale;
      this.verticalSpeed = 1.20 * speedScale;
    } else if (sceneId === 'indoor_candidate_b_sharpest') {
      this.eyeHeight = 0.58;
      this.floorY = -0.4867;
      this.xMin = -2.50;
      this.xMax = 2.50;
      this.zMin = -3.50;
      this.zMax = 2.50;
      this.walkSpeed = 1.20;
      this.sprintSpeed = 2.20;
      this.verticalSpeed = 1.10;
    } else {
      this.eyeHeight = (walkthroughMetadata.player_physics as any)?.eye_height || 1.42;
      this.floorY = (walkthroughMetadata.floor_elevation as any)?.mean_y || 0.0;
      this.walkSpeed = (walkthroughMetadata.player_physics as any)?.walk_speed || 1.30;
      this.sprintSpeed = (walkthroughMetadata.player_physics as any)?.sprint_speed || 2.40;
      this.verticalSpeed = 1.20;
      this.xMin = (walkthroughMetadata.spatial_bounds as any)?.x_min || -5.0;
      this.xMax = (walkthroughMetadata.spatial_bounds as any)?.x_max || 5.0;
      this.zMin = (walkthroughMetadata.spatial_bounds as any)?.z_min || -6.0;
      this.zMax = (walkthroughMetadata.spatial_bounds as any)?.z_max || 6.0;
    }

    // Initialize position from camera
    this.position = this.camera.position.clone();
    if (this.position.lengthSq() < 0.001) {
      this.position.set(0, this.floorY + this.eyeHeight, -1.0);
    }

    // Initialize pitch and yaw from camera quaternion
    const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
    this.yaw = euler.y;
    this.pitch = Math.max(-1.48, Math.min(1.48, euler.x));
  }

  public activate(): void {
    document.addEventListener('keydown', this.onKeyDownBound);
    document.addEventListener('keyup', this.onKeyUpBound);
    document.addEventListener('mousemove', this.onMouseMoveBound);
    document.addEventListener('pointerlockchange', this.onPointerLockChangeBound);
    window.addEventListener('blur', this.onBlurBound);
    this.domElement.addEventListener('wheel', this.onWheelBound, { passive: false });

    this.requestPointerLock();
    this.syncCamera();
  }

  public deactivate(): void {
    document.removeEventListener('keydown', this.onKeyDownBound);
    document.removeEventListener('keyup', this.onKeyUpBound);
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('pointerlockchange', this.onPointerLockChangeBound);
    window.removeEventListener('blur', this.onBlurBound);
    this.domElement.removeEventListener('wheel', this.onWheelBound);

    this.onBlur();
    this.exitPointerLock();
  }

  public requestPointerLock(): void {
    if (this.domElement.requestPointerLock) {
      this.domElement.requestPointerLock();
    }
  }

  public exitPointerLock(): void {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  private onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isPointerLocked) return;

    this.yaw -= e.movementX * this.mouseSensitivity;
    this.pitch -= e.movementY * this.mouseSensitivity;

    // Clamp pitch between -85 and +85 degrees
    const maxPitch = (85 * Math.PI) / 180;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  private onWheel(e: WheelEvent): void {
    if (!this.isPointerLocked) return;
    e.preventDefault();
    const zoomDir = new THREE.Vector3();
    this.camera.getWorldDirection(zoomDir);
    const zoomAmount = (e.deltaY > 0 ? -0.25 : 0.25) * (this.isSprinting ? 2.0 : 1.0);
    this.position.addScaledVector(zoomDir, zoomAmount);
    this.syncCamera();
  }

  private onKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveState.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveState.right = true;
        break;
      case 'Space':
        this.moveState.up = true;
        e.preventDefault(); // Crucial: Prevent page scrolling
        break;
      case 'KeyC':
        this.moveState.down = true;
        e.preventDefault();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
      case 'KeyO':
        this.isFlyMode = !this.isFlyMode;
        if (this.callbacks.onModeChange) {
          this.callbacks.onModeChange(this.isFlyMode ? 'FLY' : 'WALK');
        }
        break;
      case 'KeyM':
        if (this.callbacks.onToggleMiniMap) this.callbacks.onToggleMiniMap();
        break;
      case 'KeyP':
        if (this.callbacks.onTogglePointCloud) this.callbacks.onTogglePointCloud();
        break;
      case 'KeyG':
      case 'Escape':
        if (this.callbacks.onExitRequest) this.callbacks.onExitRequest();
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveState.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveState.right = false;
        break;
      case 'Space':
        this.moveState.up = false;
        e.preventDefault();
        break;
      case 'KeyC':
        this.moveState.down = false;
        e.preventDefault();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
    }
  }

  private onBlur(): void {
    this.moveState.forward = false;
    this.moveState.backward = false;
    this.moveState.left = false;
    this.moveState.right = false;
    this.moveState.up = false;
    this.moveState.down = false;
    this.isSprinting = false;
    this.velocity.set(0, 0, 0);
  }

  /**
   * Main physics & movement update loop (called on every requestAnimationFrame).
   */
  public update(deltaTimeSec: number): void {
    const dt = Math.min(deltaTimeSec, 0.05);

    // Calculate movement directions relative to camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const up = new THREE.Vector3(0, 1, 0);

    const moveDir = new THREE.Vector3();
    if (this.moveState.forward) moveDir.add(forward);
    if (this.moveState.backward) moveDir.sub(forward);
    if (this.moveState.right) moveDir.add(right);
    if (this.moveState.left) moveDir.sub(right);
    const vertFactor = this.verticalSpeed / Math.max(0.1, this.walkSpeed);
    if (this.moveState.up) moveDir.add(up.clone().multiplyScalar(vertFactor));
    if (this.moveState.down) moveDir.sub(up.clone().multiplyScalar(vertFactor));

    const speed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();
      const targetVelocity = moveDir.clone().multiplyScalar(speed);
      this.velocity.lerp(targetVelocity, 0.28);
    } else {
      this.velocity.lerp(new THREE.Vector3(), 0.38);
    }

    // Attempted movement
    const displacement = this.velocity.clone().multiplyScalar(dt);
    if (displacement.lengthSq() > 1e-6) {
      this.applyCollisionAndMove(displacement);
    }

    // In Walk mode, maintain ground elevation plus jump offset; in Fly mode, allow full 3D elevation
    if (!this.isFlyMode) {
      const minEyeY = this.floorY + 0.40;
      this.position.y = Math.max(minEyeY, this.position.y);
    }

    this.syncCamera();

    // Trigger proximity tracking against original video frames
    this.updateProximityFrame();

    if (this.callbacks.onPositionUpdate) {
      this.callbacks.onPositionUpdate(this.position.clone(), this.yaw);
    }
  }

  /**
   * Resolves horizontal obstacle and boundary collision with sliding physics.
   */
  private applyCollisionAndMove(displacement: THREE.Vector3): void {
    let newX = this.position.x + displacement.x;
    let newY = this.position.y + displacement.y;
    let newZ = this.position.z + displacement.z;
    let status: 'CLEAR' | 'SLIDING' | 'BOUNDARY' = 'CLEAR';

    // 1. Spatial Boundary Clamping
    const clampedX = Math.max(this.xMin + this.playerRadius, Math.min(this.xMax - this.playerRadius, newX));
    const clampedY = Math.max(this.yMin, Math.min(this.yMax, newY));
    const clampedZ = Math.max(this.zMin + this.playerRadius, Math.min(this.zMax - this.playerRadius, newZ));

    if (clampedX !== newX || clampedZ !== newZ || clampedY !== newY) {
      status = 'BOUNDARY';
      newX = clampedX;
      newY = clampedY;
      newZ = clampedZ;
    }

    // 2. Obstacle Collision with Wall-Sliding (for indoor environments with regions)
    if (!this.isFlyMode && this.regions.length > 0) {
      for (const reg of this.regions) {
        if (reg.type !== 'obstacle') continue;

        const [ox1, oz1, ox2, oz2] = reg.bounds;
        const expandedX1 = ox1 - this.playerRadius;
        const expandedX2 = ox2 + this.playerRadius;
        const expandedZ1 = oz1 - this.playerRadius;
        const expandedZ2 = oz2 + this.playerRadius;

        if (newX >= expandedX1 && newX <= expandedX2 && newZ >= expandedZ1 && newZ <= expandedZ2) {
          status = 'SLIDING';

          const dLeft = Math.abs(newX - expandedX1);
          const dRight = Math.abs(newX - expandedX2);
          const dFront = Math.abs(newZ - expandedZ1);
          const dBack = Math.abs(newZ - expandedZ2);

          const minOverlap = Math.min(dLeft, dRight, dFront, dBack);

          if (minOverlap === dLeft) newX = expandedX1;
          else if (minOverlap === dRight) newX = expandedX2;
          else if (minOverlap === dFront) newZ = expandedZ1;
          else newZ = expandedZ2;
        }
      }
    }

    this.position.x = newX;
    this.position.y = newY;
    this.position.z = newZ;

    if (this.callbacks.onCollisionStatus) {
      this.callbacks.onCollisionStatus(status);
    }
  }

  /**
   * Finds the closest source video capture frame to current player position.
   */
  private updateProximityFrame(): void {
    if (!this.callbacks.onClosestFrameChange || this.trajectory.length === 0) return;

    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.trajectory.length; i++) {
      const pt = this.trajectory[i];
      const dx = this.position.x - pt.position[0];
      const dy = this.position.y - pt.position[1];
      const dz = this.position.z - pt.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== this.lastClosestIndex) {
      this.lastClosestIndex = closestIdx;
      this.callbacks.onClosestFrameChange(this.trajectory[closestIdx], minDistance);
    }
  }

  private syncCamera(): void {
    this.camera.position.copy(this.position);

    // Apply pitch & yaw to camera rotation
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getYaw(): number {
    return this.yaw;
  }

  public isFlying(): boolean {
    return this.isFlyMode;
  }

  public setFlyMode(fly: boolean): void {
    this.isFlyMode = fly;
  }

  public setPosition(pos: [number, number, number]): void {
    this.position.set(pos[0], pos[1], pos[2]);
    this.syncCamera();
  }
}
