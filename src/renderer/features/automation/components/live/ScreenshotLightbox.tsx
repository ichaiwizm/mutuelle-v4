import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/renderer/components/ui/Button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

type Screenshot = {
  path: string;
  stepName: string;
  stepId: string;
};

type ScreenshotLightboxProps = {
  screenshots: Screenshot[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};

export function ScreenshotLightbox({
  screenshots,
  initialIndex = 0,
  isOpen,
  onClose,
}: ScreenshotLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const currentScreenshot = screenshots[currentIndex];

  // Load image data
  const loadImage = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    setImageData(null);
    setZoom(1);

    try {
      const data = await window.api.automation.readScreenshot(path);
      setImageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load screenshot");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load image when index changes
  useEffect(() => {
    if (isOpen && currentScreenshot) {
      loadImage(currentScreenshot.path);
    }
  }, [isOpen, currentScreenshot, loadImage]);

  // Reset index when screenshots change
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, screenshots]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          setCurrentIndex((i) => Math.max(0, i - 1));
          break;
        case "ArrowRight":
          setCurrentIndex((i) => Math.min(screenshots.length - 1, i + 1));
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(3, z + 0.25));
          break;
        case "-":
          setZoom((z) => Math.max(0.5, z - 0.25));
          break;
        case "0":
          setZoom(1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, screenshots.length, onClose]);

  // Download image
  const handleDownload = useCallback(() => {
    if (!imageData || !currentScreenshot) return;

    const link = document.createElement("a");
    link.href = imageData;
    link.download = `screenshot-${currentScreenshot.stepId}.png`;
    link.click();
  }, [imageData, currentScreenshot]);

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
          <span className="text-white font-medium">
            {currentScreenshot?.stepName}
          </span>
          <span className="text-zinc-400 text-sm">
            {currentIndex + 1} / {screenshots.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="text-white hover:bg-white/10"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="text-white hover:bg-white/10"
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            className="text-white hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-zinc-600 mx-2" />

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!imageData}
            className="text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((i) => i - 1);
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

      {currentIndex < screenshots.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((i) => i + 1);
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
      <div
        className="max-w-[90vw] max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center w-96 h-64">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center w-96 h-64 text-center">
            <p className="text-red-400 mb-2">Failed to load screenshot</p>
            <p className="text-zinc-500 text-sm">{error}</p>
          </div>
        ) : imageData ? (
          <img
            src={imageData}
            alt={currentScreenshot?.stepName}
            className="max-w-none transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        ) : null}
      </div>

      {/* Thumbnail strip */}
      {screenshots.length > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center gap-2 overflow-x-auto py-2">
            {screenshots.map((screenshot, index) => (
              <button
                key={screenshot.path}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-16 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                  "bg-zinc-800",
                  index === currentIndex
                    ? "border-cyan-500 ring-2 ring-cyan-500/30"
                    : "border-transparent hover:border-zinc-600"
                )}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
