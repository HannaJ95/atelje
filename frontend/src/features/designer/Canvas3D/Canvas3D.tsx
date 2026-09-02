import styles from "./Canvas3D.module.css";
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Floor } from "../scene-components/structural/Floor";
import { Wall } from "../scene-components/structural/Wall";
import { Ceiling } from "../scene-components/structural/Ceiling";
import { Sofa } from "../scene-components/furniture/Sofa";
import { FurnitureColor } from "../FurnitureForm/FurnitureForm";
import { Frame } from "../scene-components/furniture/Frame";
import { FrameData } from "../FrameForm/FrameForm";
import { preloadTextures } from "@/lib/preloadTextures";

interface Canvas3DProps {
  wallWidth: number;
  ceilingHeight: number;
  wallColor: string;
  flooring: string;
  light: number;
  furnitureColor: FurnitureColor;
  furnitureWidth: number;
  furnitureDepth: number;
  furnitureHeight: number;
  frames: FrameData[];
  selectedFrameId?: string | null;
  onFrameSelect?: (frameId: string | null) => void;
  onFramePositionChange?: (frameId: string, position: THREE.Vector3) => void;
  onFramePositionUpdate?: (index: number, position: [number, number, number]) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  occupiedPositions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    frameId: string;
  }>;
  onCameraReady?: (resetCamera: () => void) => void;
}

export default function Canvas3D({ wallWidth, ceilingHeight, wallColor, flooring, light, furnitureColor, furnitureWidth, furnitureDepth, furnitureHeight, frames, selectedFrameId, onFrameSelect, onFramePositionUpdate, canvasRef, occupiedPositions, onCameraReady } : Canvas3DProps) {

useEffect(() => {
    preloadTextures();
  }, []);

const cellSize = 0.01; // 1 cm
const floorSize = Math.max(wallWidth, 300);

const YPosition = ceilingHeight * cellSize;
const pointLightHeight = YPosition * 1.0;
const directionalLightHeight = YPosition * 3.33;

const cameraYPosition = Math.max(0.5, YPosition * 0.6);
// Camera distance adjustment based on wall width
const minWall = 300;
const maxWall = 900;
const t = Math.max(0, Math.min(1, (wallWidth - minWall) / (maxWall - minWall)));

const cameraDistance = THREE.MathUtils.lerp(
  6,   // Camera distance for small wall (300)
  4,   // Camera distance for large wall (900)
  t
);

const minDistanceZoom = cameraDistance * 0.3;
const maxDistanceZoom = cameraDistance;

// ZoomSpeed adjustment based on wall width (distance)
const zoomSpeed = 0.8 + (wallWidth / 10000);

const minPanSpeed = 0.6;
const maxPanSpeed = 3.0;

const orbitTargetY = cameraYPosition - 0.15;

const maxPanX = THREE.MathUtils.lerp(0.15, 2.5, t);
const maxPanY = THREE.MathUtils.lerp(0.3, 1.0, t);

const wallRef = useRef<THREE.Mesh>(null);
const controlsRef = useRef<OrbitControlsImpl>(null);

// Store initial camera state for camera reset
const initialCameraState = useRef({
  position: [0, cameraYPosition, cameraDistance] as [number, number, number],
  target: [0, orbitTargetY, 0] as [number, number, number]
});

// Update initial state when wall/ceiling dimensions change
useEffect(() => {
  initialCameraState.current = {
    position: [0, cameraYPosition, cameraDistance],
    target: [0, orbitTargetY, 0]
  };
}, [cameraYPosition, cameraDistance, orbitTargetY]);

// Send resetCamera function to parent
useEffect(() => {
  if (onCameraReady && controlsRef.current) {
    const resetCamera = () => {
      if (controlsRef.current) {
        // Reset camera back to initial position
        controlsRef.current.object.position.set(
          initialCameraState.current.position[0],
          initialCameraState.current.position[1],
          initialCameraState.current.position[2]
        );
          
        // Reset orbit target
        controlsRef.current.target.set(
          initialCameraState.current.target[0],
          initialCameraState.current.target[1],
          initialCameraState.current.target[2]
        );
          
        controlsRef.current.update();
      }
    };
      
    onCameraReady(resetCamera);
  }
}, [onCameraReady, controlsRef.current]);

// Use internal state if no external state is provided (backward compatibility)
const [internalSelectedFrameId, setInternalSelectedFrameId] = useState<string | null>(null);

const currentSelectedFrameId = selectedFrameId !== undefined ? selectedFrameId : internalSelectedFrameId;
const handleFrameSelect = onFrameSelect || setInternalSelectedFrameId;
const [isDraggingFrame, setIsDraggingFrame] = useState(false);

const handlePositionUpdate = (frameId: string, position: THREE.Vector3) => {
  const frameIndex = frames.findIndex(f => f.id === frameId);
  if (frameIndex !== -1 && onFramePositionUpdate) {
    onFramePositionUpdate(frameIndex, [position.x, position.y, position.z]);
  }
};

const handlePanControls = () => {
  if (!controlsRef.current) return;

  const controls = controlsRef.current;

  // Calculate current zoom factor based on camera distance and update dynamically
  const currentDistance = controls.object.position.distanceTo(controls.target);
  const zoomFactor = (currentDistance - minDistanceZoom) / (maxDistanceZoom - minDistanceZoom);
  controls.panSpeed = THREE.MathUtils.lerp(maxPanSpeed, minPanSpeed, zoomFactor);

  // Clamp panning based on wall size
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, -maxPanX, maxPanX);
  controls.target.y = THREE.MathUtils.clamp(
    controls.target.y,
    orbitTargetY - maxPanY,
    orbitTargetY + maxPanY
  );
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, -maxPanX, maxPanX);
};

  return (
    <section className={styles.designerWindow}>
      <Canvas
        key={`${wallWidth}-${ceilingHeight}`}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={(state) => {
          if (canvasRef) {
            canvasRef.current = state.gl.domElement;
          }
        }}
        camera={{ 
          position: [0, cameraYPosition, cameraDistance],
          fov: 30,
          near: 1,
          far: 100
        }}
        onPointerMissed={() => handleFrameSelect(null)} // Deselect frame when clicking anywhere else in the scene
        shadows
      >
        <ambientLight intensity={light} />
        <pointLight position={[0, pointLightHeight, -YPosition * 0.33]} intensity={3} castShadow />
        <directionalLight
          position={[0, directionalLightHeight, 0]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-2, 5, cameraDistance / 2]}
          intensity={0.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Wall wallColor={wallColor} wallWidth={wallWidth} ceilingHeight={ceilingHeight} wallPlacement='front' ref={wallRef} gridCellSize={cellSize} floorSize={floorSize}/>
        <Wall wallColor={wallColor} wallWidth={wallWidth} ceilingHeight={ceilingHeight} wallPlacement='left' gridCellSize={cellSize} floorSize={floorSize}/>
        <Wall wallColor={wallColor} wallWidth={wallWidth} ceilingHeight={ceilingHeight} wallPlacement='right' gridCellSize={cellSize} floorSize={floorSize}/>
        <Floor flooring={flooring} gridSize={floorSize} gridCellSize={cellSize} />
        <Ceiling ceilingHeight={ceilingHeight} gridSize={floorSize} gridCellSize={cellSize} />
        <Sofa sofaColor={furnitureColor.sofa} sofaWidth={furnitureWidth} sofaDepth={furnitureDepth} sofaHeight={furnitureHeight} floorSize={floorSize} gridCellSize={cellSize} />
        {/* Render all frames */}
        {frames.map((frame) => (
          <Frame 
            key={frame.id}
            frameColor={frame.frameColor}
            frameSize={frame.frameSize}
            frameOrientation={frame.frameOrientation}
            imageUrl={frame.imageUrl}
            floorSize={floorSize}
            gridCellSize={cellSize}
            wallMesh={wallRef.current}
            wallWidth={wallWidth}
            ceilingHeight={ceilingHeight}
            selected={selectedFrameId === frame.id}
            onSelect={() => handleFrameSelect(frame.id)}
            onDragStart={() => setIsDraggingFrame(true)}
            onDragEnd={() => setIsDraggingFrame(false)}
            onPositionChange={(position) => handlePositionUpdate(frame.id, position)}
            framePosition={frame.position}
            occupiedPositions={occupiedPositions.filter(pos => pos.frameId !== frame.id)}
          />
        ))}

        <OrbitControls 
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={isDraggingFrame ? false : true} // Disable rotation when a frame is selected
          minDistance={minDistanceZoom}
          maxDistance={maxDistanceZoom}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2} // Prevent camera from going below floor
          minAzimuthAngle={-Math.PI / 6}      // limit left rotation (~-30°)
          maxAzimuthAngle={Math.PI / 6}       // limit right rotation (~+30°)
          target={[0, orbitTargetY, 0]}
          rotateSpeed={0.2}
          zoomSpeed={zoomSpeed}
          onChange={handlePanControls}
        />
      </Canvas>
    </section>
  )
}