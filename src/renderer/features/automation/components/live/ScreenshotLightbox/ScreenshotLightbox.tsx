import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScreenshotLightboxProps } from "./types";
import { useScreenshotLightbox } from "./useScreenshotLightbox";
import { ThumbnailStrip, ZoomControls, ImageViewer } from "./components";

export function ScreenshotLightbox({
  screenshots,
  initialIndex = 0,
  isOpen,
  onClose,
}: ScreenshotLightboxProps) {
  const {
    currentIndex,
    currentScreenshot,
    imageData,
    loading,
    error,
    zoom,
    handleDownload,
    zoomIn,
    zoomOut,
    resetZoom,
    goToPrevious,
    goToNext,
    goToIndex,
    canGoPrevious,
    canGoNext,
  } = useScreenshotLightbox({ screenshots, initialIndex, isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/90 backdrop-blur-sm"
      )}
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">{currentScreenshot?.stepName}</span>
          <span className="text-zinc-400 text-sm">
            {currentIndex + 1} / {screenshots.length}
          </span>
        </div>

        <ZoomControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
          onDownload={handleDownload}
          onClose={onClose}
          canDownload={!!imageData}
        />
      </div>

      {/* Navigation arrows */}
      {canGoPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2",
            "p-3 rounded-full bg-black/50 text-white",
            "hover:bg-black/70 transition-colors"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {canGoNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2",
            "p-3 rounded-full bg-black/50 text-white",
            "hover:bg-black/70 transition-colors"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image container */}
      <ImageViewer
        imageData={imageData}
        loading={loading}
        error={error}
        zoom={zoom}
        altText={currentScreenshot?.stepName || "Screenshot"}
      />

      {/* Thumbnail strip */}
      <ThumbnailStrip
        screenshots={screenshots}
        currentIndex={currentIndex}
        onSelect={goToIndex}
      />
    </div>
  );
}
