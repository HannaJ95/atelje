"use client";

import { useParams, useRouter } from "next/navigation";
import { useDesign } from "@/features/designs/useDesign";
import { useState, useEffect } from "react";
import { useCustomDesign } from "@/features/designs/useCustomDesign";
import { useAuth } from "@/contexts/AuthContext";
import DesignerWorkspace from "@/features/designer/DesignerWorkspace/DesignerWorkspace";
import { useUnsavedChangesWarning } from "@/lib/useUnsavedChangesWarning";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute/ProtectedRoute";

export default function DesignerPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const router = useRouter();

  const { user } = useAuth();

  const { saveDesign, loadDesign, currentDesign, isLoading, error } =
    useDesign();
  const [designName, setDesignName] = useState("");

  const {
    loadSceneData,
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
    markAsSaved,
    hasUnsavedChanges,
    occupiedPositions,
    addOccupiedPosition,
  } = useCustomDesign();

  useUnsavedChangesWarning(hasUnsavedChanges);

  //This loads the design
  useEffect(() => {
    const fetchAndLoad = async () => {
      if (id && user) {
        const loadedDesign = await loadDesign(id);

        if (loadedDesign == undefined) {
          router.push("/designer");
          return;
        }
        loadSceneData(loadedDesign.designData);
      }
    };

    fetchAndLoad(); // Call it
  }, [id, loadDesign, loadSceneData, user, router]);

  //This sets the new design name
  useEffect(() => {
    if (currentDesign?.name) {
      setDesignName(currentDesign.name);
    }
  }, [currentDesign]);

  //this saves the design
  async function handleSave(screenshots?: {
    fullBlob: Blob;
    thumbnailBlob: Blob;
  }) {
    const sceneData = getSceneData();
    if (!id) {
      console.error("Design ID is missing - this should never happen");
      return;
    }
    const result = await saveDesign(id, designName, sceneData, screenshots);
    if (result) {
      markAsSaved();
    }
  }

  return (
    <ProtectedRoute>
      <DesignerWorkspace
        designName={designName}
        onDesignNameChange={setDesignName}
        onSave={handleSave}
        isLoading={isLoading}
        error={error}
        screenshotUrl={currentDesign?.screenshotUrl}
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
    </ProtectedRoute>
  );
}
