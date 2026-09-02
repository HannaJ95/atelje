import { useState, useCallback } from "react";
import { FurnitureColor } from "../designer/FurnitureForm/FurnitureForm";
import { FrameData } from "../designer/FrameForm/FrameForm";

export interface CustomDesign {
  wallWidth: number;
  ceilingHeight: number;
  wallColor: string;
  flooring: string;
  light: number;
  furnitureColor: FurnitureColor;
  furnitureWidth: number,
  furnitureDepth: number,
  furnitureHeight: number,
  frames: FrameData[];
}

export type DesignData = {
  sofa: {
    color: FurnitureColor;
    width: number,
    depth: number,
    height: number
  };

  wall: {
    color: string;
    width: number;
    height: number;
  };

  frames: FrameData[];

  flooring: string;
  light: number;
};

interface OccupiedPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  frameId: string;
}

export function useCustomDesign(initialDesign?: Partial<CustomDesign>) {
  const [customDesign, setCustomDesignInternal] = useState<CustomDesign>({
    wallWidth: initialDesign?.wallWidth ?? 500,
    ceilingHeight: initialDesign?.ceilingHeight ?? 300,
    wallColor: initialDesign?.wallColor ?? "#DEDEDE",
    flooring: initialDesign?.flooring ?? "birch-floor-parquet",
    light: initialDesign?.light ?? 1,
    furnitureColor: initialDesign?.furnitureColor ?? { sofa: "#8B4513" },
    furnitureDepth: initialDesign?.furnitureDepth ?? 80,
    furnitureWidth: initialDesign?.furnitureWidth ?? 210,
    furnitureHeight: initialDesign?.furnitureHeight ?? 85,
    frames: initialDesign?.frames ?? []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [occupiedPositions, setOccupiedPositions] = useState<OccupiedPosition[]>([])

  const setCustomDesign = (
  updater: CustomDesign | ((prev: CustomDesign) => CustomDesign),
  markAsUnsaved = true
) => {
  if (markAsUnsaved) {
    setHasUnsavedChanges(true);
  }
  setCustomDesignInternal(updater);
  };
  
  const markAsSaved = () => {
    setHasUnsavedChanges(false);
  }

  // Structural helper functions
  const setWallWidth = (value: number) => {
    setCustomDesign((prev) => ({ ...prev, wallWidth: value }));
  };

  const setCeilingHeight = (value: number) => {
    setCustomDesign((prev) => ({ ...prev, ceilingHeight: value }));
  };

  const setWallColor = (value: string) => {
    setCustomDesign((prev) => ({ ...prev, wallColor: value }));
  };

  const setFlooring = (value: string) => {
    setCustomDesign((prev) => ({ ...prev, flooring: value }));
  }

  const setLight = (value: number) => {
    setCustomDesign((prev) => ({ ...prev, light: value }));
  }

  // Furniture helper functions
  const setFurnitureColor = (value: FurnitureColor) => {
    setCustomDesign((prev) => ({ ...prev, furnitureColor: value }));
  };

  const setFurnitureWidth = (value: number) => {
    setCustomDesign((prev) => ({ ...prev, furnitureWidth: value }));
  };
  const setFurnitureDepth = (value: number) => {
    setCustomDesign((prev) => ({ ...prev, furnitureDepth: value }));
  };

  const setFurnitureHeight = (value: number) => {
    setCustomDesign((prev) => ({ ...prev, furnitureHeight: value }));
  };

  // Frame helper functions
  const addFrame = (frame: FrameData) => {
    setCustomDesign((prev) => ({ 
      ...prev, 
      frames: [...prev.frames, frame] 
    }));
  };

  const updateFrame = (index: number, updatedFrame: Partial<FrameData>) => {
    setCustomDesign((prev) => ({
      ...prev,
      frames: prev.frames.map((frame, i) => 
        i === index ? { ...frame, ...updatedFrame } : frame
      )
    }));
  };

  const setFrameColor = (index: number, color: string) => {
    updateFrame(index, { frameColor: color });
  };

  const setFrameImage = (index: number, imageUrl: string) => {
    updateFrame(index, { imageUrl });
  };

  const setFrameSize = (index: number, size: string) => {
    const frame = customDesign.frames[index];
    if (!frame) return;
  
    updateFrame(index, { frameSize: size });
    updateOccupiedPositionDimensions(frame.id, size, frame.frameOrientation);
  };

  const setFrameOrientation = (index: number, orientation: 'portrait' | 'landscape') => {
    const frame = customDesign.frames[index];
    if (!frame) return;
  
    updateFrame(index, { frameOrientation: orientation });
    updateOccupiedPositionDimensions(frame.id, frame.frameSize, orientation);
  };

  const setFramePosition = (index: number, framePosition: [number, number, number]) => {
    const frame = customDesign.frames[index];
    if (!frame) return;
  
    updateFrame(index, { position: framePosition });
  
    setOccupiedPositions(prev => 
    prev.map(pos => 
      pos.frameId === frame.id
        ? { ...pos, x: framePosition[0], y: framePosition[1] }
        : pos
      )
    );

    updateOccupiedPositionDimensions(frame.id, frame.frameSize, frame.frameOrientation);
  }

  const deleteFrame = (index: number) => {
    const frame = customDesign.frames[index];
    if (frame) {
      setOccupiedPositions(prev => 
        prev.filter(pos => pos.frameId !== frame.id)
      );
    }
    setCustomDesign((prev) => ({
      ...prev,
      frames: prev.frames.filter((frame, i) => i !== index)
    }));
  };

  // Occupied positions helper functions
  const addOccupiedPosition = (position: OccupiedPosition) => {
    setOccupiedPositions(prev => [...prev, position]);
  };

  const updateOccupiedPositionDimensions = (frameId: string, frameSize: string, frameOrientation: 'portrait' | 'landscape') => {
    const [width, height] = frameSize.split('x').map(Number);
    const gridCellSize = 0.01;
  
    const isPortrait = frameOrientation === 'portrait';
    const frameWidth = isPortrait 
      ? Math.min(width || 50, height || 70) * gridCellSize
      : Math.max(width || 50, height || 70) * gridCellSize;
    const frameHeight = isPortrait
      ? Math.max(width || 50, height || 70) * gridCellSize
      : Math.min(width || 50, height || 70) * gridCellSize;
  
    setOccupiedPositions(prev => 
      prev.map(pos => 
        pos.frameId === frameId
          ? { ...pos, width: frameWidth, height: frameHeight }
          : pos
      )
    );
  };


  // Inside useCustomDesign:
  const getSceneData = (): string => {
    const data: DesignData = {
      wall: {
        color: customDesign.wallColor,
        width: customDesign.wallWidth,
        height: customDesign.ceilingHeight
      },
      sofa: {
        color: customDesign.furnitureColor,
        width: customDesign.furnitureWidth,
        depth: customDesign.furnitureDepth,
        height: customDesign.furnitureHeight
      },
      frames: customDesign.frames,
      flooring: customDesign.flooring,
      light: customDesign.light
    };
    return JSON.stringify(data);
  };

  const loadSceneData = useCallback((jsonString: string): void => {
    const currentDesign: DesignData = JSON.parse(jsonString)
  setCustomDesign({
    wallWidth: currentDesign.wall.width,
    ceilingHeight: currentDesign.wall.height,
    wallColor: currentDesign.wall.color,
    flooring: currentDesign.flooring,
    light: currentDesign.light ?? 1,
    furnitureColor: currentDesign.sofa.color,
    furnitureDepth: currentDesign.sofa.depth,
    furnitureWidth: currentDesign.sofa.width,
    furnitureHeight: currentDesign.sofa.height,
    frames: currentDesign.frames || []
  }, false);
  // Rebuild occupied positions from loaded frames
    const gridCellSize = 0.01;
    const newOccupiedPositions = currentDesign.frames.map(frame => {
      const [width, height] = frame.frameSize.split('x').map(Number);
      return {
        x: frame.position[0],
        y: frame.position[1],
        width: (width || 50) * gridCellSize,
        height: (height || 70) * gridCellSize,
        frameId: frame.id
      };
    });
    setOccupiedPositions(newOccupiedPositions);
  }, [])


  return {
    customDesign,
    setCustomDesign,
    setWallWidth,
    setCeilingHeight,
    setWallColor,
    setFlooring,
    setLight,
    setFurnitureColor,
    setFurnitureDepth,
    setFurnitureWidth,
    setFurnitureHeight,
    addFrame,
    updateFrame,
    setFrameColor,
    setFrameImage,
    setFrameSize,
    setFrameOrientation,
    setFramePosition,
    deleteFrame,
    getSceneData,
    loadSceneData,
    hasUnsavedChanges,
    markAsSaved,
    occupiedPositions,
    addOccupiedPosition
  };
}
