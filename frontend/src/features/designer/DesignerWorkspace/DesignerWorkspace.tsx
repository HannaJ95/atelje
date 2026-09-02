import { useCustomDesign } from "@/features/designs/useCustomDesign";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import FurnitureForm, { FurnitureColor } from "../FurnitureForm/FurnitureForm";
import StructuralForm from "../StructuralForm/StructuralForm";
import SingleFrameForm from "../SingleFrameForm/SingleFrameForm";
import FrameForm from "../FrameForm/FrameForm";
import Canvas3D from "../Canvas3D/Canvas3D";
import { FrameData } from "../FrameForm/FrameForm";
import { captureScreenshot } from "@/lib/screenshotCapture";
import { DownloadScreenshotButton } from "@/elements/DownloadScreenshotButton/DownloadScreenshotButton";
import styles from "./DesignerWorkspace.module.css";
import { useModal } from "@/contexts/ModalContext";
import { useAuth } from "@/contexts/AuthContext";
import CircleButton from "@/elements/CircleButton/CircleButton";
import LoadingSpinner from "@/elements/LoadingSpinner/LoadingSpinner";

interface OccupiedPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  frameId: string;
}

interface DesignerWorkspaceProps {
  designName: string;
  onDesignNameChange: (name: string) => void;
  onSave: (screenshots?: {
    fullBlob: Blob;
    thumbnailBlob: Blob;
  }) => Promise<void>;
  isLoading: boolean;
  error?: string;
  screenshotUrl?: string | null;
  // Add these from useCustomDesign:
  customDesign: ReturnType<typeof useCustomDesign>["customDesign"];
  setWallWidth: (width: number) => void;
  setCeilingHeight: (height: number) => void;
  setWallColor: (color: string) => void;
  setFlooring: (flooring: string) => void;
  setFurnitureColor: (color: FurnitureColor) => void;
  setFurnitureDepth: (depth: number) => void;
  setFurnitureWidth: (width: number) => void;
  setFurnitureHeight: (height: number) => void;
  addFrame: (frame: FrameData) => void;
  setFrameColor: (index: number, color: string) => void;
  setFrameImage: (index: number, url: string) => void;
  setFrameSize: (index: number, size: string) => void;
  setFrameOrientation: (
    index: number,
    orientation: "portrait" | "landscape"
  ) => void;
  setFramePosition: (index: number, position: [number, number, number]) => void;
  deleteFrame: (index: number) => void;
  hasUnsavedChanges: boolean;
  occupiedPositions: OccupiedPosition[];
  addOccupiedPosition: (position: OccupiedPosition) => void;
}

export default function DesignerWorkspace({
  designName,
  onDesignNameChange,
  onSave,
  isLoading,
  error,
  screenshotUrl,
  customDesign,
  setWallWidth,
  setCeilingHeight,
  setWallColor,
  setFlooring,
  setFurnitureColor,
  setFurnitureDepth,
  setFurnitureHeight,
  setFurnitureWidth,
  addFrame,
  setFrameColor,
  setFrameImage,
  setFrameSize,
  setFrameOrientation,
  setFramePosition,
  deleteFrame,
  hasUnsavedChanges,
  occupiedPositions,
  addOccupiedPosition,
}: DesignerWorkspaceProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"save" | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [showSideBar, setShowSideBar] = useState<
    "frames" | "sofa" | "single-frame"
  >("frames");
  const { openModal } = useModal();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  const handleCameraReady = (resetCamera: () => void) => {
    resetCameraRef.current = resetCamera;
  };

  const handleSaveClick = () => {
    if (!user) {
      setPendingAction("save");
      openModal("login");
      return;
    }
    if (!designName) {
      openModal("save-design", {
        callbacks: { saveDesignName: onDesignNameChange },
      });
    } else {
      handleSave();
    }
  };

  useEffect(() => {
    if (pendingAction === "save" && user) {
      setPendingAction(null);
      openModal("save-design", {
        callbacks: { saveDesignName: onDesignNameChange },
      });
    }
  }, [pendingAction, user]);

  useEffect(() => {
    if (designName && hasUnsavedChanges) {
      handleSave();
    }
  }, [designName]);

  useEffect(() => {
    if (errorMessage) {
      const timeoutId = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    return;
  }, [errorMessage]);

  const handleSave = async () => {
    if (!canvasRef.current) {
      console.error("Canvas not ready");
      await onSave(); // Save without screenshots
      return;
    }

    try {
      // Temporarily deselect frame for screenshot
      const wasSelected = selectedFrameId;
      setSelectedFrameId(null);

      // Reset camera to default position before screenshot
      if (resetCameraRef.current) {
        resetCameraRef.current();
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture screenshots
      const screenshots = await captureScreenshot(canvasRef.current);

      // Restore selected frame
      if (wasSelected) {
        setSelectedFrameId(wasSelected);
      }
      await onSave(screenshots);
    } catch (error) {
      console.error("Screenshot capture error:", error);
      setErrorMessage("Screenshot capture failed, but your design was saved");
      await onSave();
    }
  };

  // Find the selected frame by ID
  const selectedFrameIndex = customDesign.frames.findIndex(
    (frame) => frame.id === selectedFrameId
  );
  const selectedFrame =
    selectedFrameIndex !== -1 ? customDesign.frames[selectedFrameIndex] : null;

  useEffect(() => {
    if (!selectedFrame) setShowSideBar("frames");
    if (selectedFrame) setShowSideBar("single-frame");
  }, [selectedFrame]);

  return (
    <>
      <section className={styles.topBar}>
        <div className={styles.topBarDividerLeft}>
          <CircleButton
            variant="vanilla"
            buttonIcon={"/icons/arrow-icon.svg"}
            onClick={() => {
              router.back();
            }}
          />
          <StructuralForm
            wallWidth={customDesign.wallWidth}
            setWallWidth={setWallWidth}
            ceilingHeight={customDesign.ceilingHeight}
            setCeilingHeight={setCeilingHeight}
            wallColor={customDesign.wallColor}
            setWallColor={setWallColor}
            flooring={customDesign.flooring}
            setFlooring={setFlooring}
          />
        </div>
        <div className={styles.topBarDividerRight}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!error && errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
          {!error && hasUnsavedChanges && (
            <p className={styles.unsavedChanges}>You have unsaved changes!</p>
          )}
          <CircleButton
            variant="vanilla"
            buttonIcon="/icons/save-icon.svg"
            onClick={handleSaveClick}
            disabled={!hasUnsavedChanges}
          />
          <DownloadScreenshotButton
            screenshotUrl={screenshotUrl}
            designName={designName || "design"}
          />
          
        </div>
      </section>
      <section className={styles.workspaceSection}>
        <section className={styles.sideBarForm}>
          {!selectedFrame && (
            <div className={styles.sideBarToggleBoxes}>
              <button
                className={`${
                  showSideBar === "frames"
                    ? styles.framesButtonActive
                    : styles.framesButtonBase
                }`}
                onClick={() => setShowSideBar("frames")}
              >
                Frames
              </button>
              <button
                className={`${
                  showSideBar === "sofa"
                    ? styles.sofaButtonActive
                    : styles.sofaButtonBase
                }`}
                onClick={() => setShowSideBar("sofa")}
              >
                Sofa
              </button>
            </div>
          )}
          {showSideBar == "frames" && (
            <FrameForm
              frames={customDesign.frames}
              wallWidth={customDesign.wallWidth}
              ceilingHeight={customDesign.ceilingHeight}
              gridCellSize={0.01}
              occupiedPositions={occupiedPositions}
              onAddFrame={addFrame}
              onAddOccupiedPosition={addOccupiedPosition}
            />
          )}
          {showSideBar == "sofa" && (
            <FurnitureForm
              furnitureColor={customDesign.furnitureColor}
              setFurnitureColor={setFurnitureColor}
              furnitureDepth={customDesign.furnitureDepth}
              furnitureWidth={customDesign.furnitureWidth}
              setFurnitureDepth={setFurnitureDepth}
              setFurnitureWidth={setFurnitureWidth}
              furnitureHeight={customDesign.furnitureHeight}
              setFurnitureHeight={setFurnitureHeight}
              wallWidth={customDesign.wallWidth}
            />
          )}

          {/* Only show SingleFrameForm when a frame is selected in Canvas3D */}
          {selectedFrame &&
            selectedFrameIndex !== -1 &&
            showSideBar == "single-frame" && (
              <SingleFrameForm
                frames={customDesign.frames}
                id={selectedFrame.id}
                frameColor={selectedFrame.frameColor || "#ac924f"}
                setFrameColor={(color) =>
                  setFrameColor(selectedFrameIndex, color)
                }
                imageUrl={selectedFrame.imageUrl}
                setFrameImage={(url) => setFrameImage(selectedFrameIndex, url!)}
                frameSize={selectedFrame.frameSize || "70x50"}
                setFrameSize={(size) => setFrameSize(selectedFrameIndex, size)}
                frameOrientation={selectedFrame.frameOrientation || "portrait"}
                setFrameOrientation={(orientation) =>
                  setFrameOrientation(
                    selectedFrameIndex,
                    orientation as "portrait" | "landscape"
                  )
                }
                onDelete={() => {
                  deleteFrame(selectedFrameIndex);
                  setSelectedFrameId(null);
                }}
              />
            )}
        </section>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Canvas3D
              wallWidth={customDesign.wallWidth}
              ceilingHeight={customDesign.ceilingHeight}
              wallColor={customDesign.wallColor}
              flooring={customDesign.flooring}
              furnitureColor={customDesign.furnitureColor}
              furnitureDepth={customDesign.furnitureDepth}
              furnitureWidth={customDesign.furnitureWidth}
              furnitureHeight={customDesign.furnitureHeight}
              frames={customDesign.frames}
              selectedFrameId={selectedFrameId}
              onFrameSelect={setSelectedFrameId}
              onFramePositionUpdate={setFramePosition}
              canvasRef={canvasRef}
              occupiedPositions={occupiedPositions}
              onCameraReady={handleCameraReady}
            />
          </>
        )}
      </section>
    </>
  );
}
