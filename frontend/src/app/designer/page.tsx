"use client";

import { useDesign } from "@/features/designs/useDesign";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCustomDesign } from "@/features/designs/useCustomDesign";
import DesignerWorkspace from "@/features/designer/DesignerWorkspace/DesignerWorkspace";
import { useUnsavedChangesWarning } from "@/lib/useUnsavedChangesWarning";

export default function NewDesignPage() {
  const { createDesign, isLoading, error } = useDesign();
  const router = useRouter();
  const [designName, setDesignName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    getSceneData,
    setCeilingHeight,
    setFrameColor,
    setFrameImage,
    setFrameOrientation,
    setFramePosition,
    setFrameSize,
    setFurnitureColor,
    setFurnitureDepth,
    setFurnitureHeight,
    setFurnitureWidth,
    setWallColor,
    setFlooring,
    setLight,
    setWallWidth,
    addFrame,
    deleteFrame,
    customDesign,
    hasUnsavedChanges,
    occupiedPositions,
    addOccupiedPosition,
  } = useCustomDesign();

  useUnsavedChangesWarning(hasUnsavedChanges);

  async function handleSave(screenshots?: {
    fullBlob: Blob;
    thumbnailBlob: Blob;
  }) {
    const sceneData = getSceneData();
    const newDesign = await createDesign(designName, sceneData, screenshots);

    if (newDesign) {
      router.push(`/designer/${newDesign.id}`);
    }
  }

  return (
    <>
      {errorMessage && <p>{errorMessage}</p>}
      <DesignerWorkspace
        designName={designName}
        onDesignNameChange={setDesignName}
        onSave={handleSave}
        isLoading={isLoading}
        error={error}
        screenshotUrl={null}
        setCeilingHeight={setCeilingHeight}
        setWallWidth={setWallWidth}
        setWallColor={setWallColor}
        setFlooring={setFlooring}
        setLight={setLight}
        setFrameColor={setFrameColor}
        setFrameImage={setFrameImage}
        setFrameOrientation={setFrameOrientation}
        setFramePosition={setFramePosition}
        setFrameSize={setFrameSize}
        setFurnitureColor={setFurnitureColor}
        setFurnitureDepth={setFurnitureDepth}
        setFurnitureHeight={setFurnitureHeight}
        setFurnitureWidth={setFurnitureWidth}
        addFrame={addFrame}
        deleteFrame={deleteFrame}
        customDesign={customDesign}
        hasUnsavedChanges={hasUnsavedChanges}
        occupiedPositions={occupiedPositions}
        addOccupiedPosition={addOccupiedPosition}
      />
    </>
  );
}
