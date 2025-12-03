import { useState, useEffect, useCallback } from "react";
import type { Screenshot } from "./types";

interface UseScreenshotLightboxOptions {
  screenshots: Screenshot[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function useScreenshotLightbox({
  screenshots,
  initialIndex,
  isOpen,
  onClose,
}: UseScreenshotLightboxOptions) {
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

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, z + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.5, z - 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(screenshots.length - 1, i + 1));
  }, [screenshots.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
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
    canGoPrevious: currentIndex > 0,
    canGoNext: currentIndex < screenshots.length - 1,
  };
}
