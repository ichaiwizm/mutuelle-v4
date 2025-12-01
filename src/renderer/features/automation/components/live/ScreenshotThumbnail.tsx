import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import { Camera, AlertCircle } from "lucide-react";

// Simple in-memory cache for loaded thumbnails
const thumbnailCache = new Map<string, string>();

type ScreenshotThumbnailProps = {
  path: string;
  stepName: string;
  index: number;
  onClick: () => void;
};

export function ScreenshotThumbnail({
  path,
  stepName,
  index,
  onClick,
}: ScreenshotThumbnailProps) {
  const [imageData, setImageData] = useState<string | null>(() => thumbnailCache.get(path) ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const loadedRef = useRef(false);

  const loadThumbnail = useCallback(async () => {
    if (loadedRef.current || loading || imageData) return;

    loadedRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const data = await window.api.automation.readScreenshot(path);
      if (data) {
        thumbnailCache.set(path, data);
        setImageData(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load thumbnail:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [path, loading, imageData]);

  // Lazy load with IntersectionObserver
  useEffect(() => {
    if (imageData) return; // Already loaded

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadThumbnail();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [loadThumbnail, imageData]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        "group relative aspect-video rounded-lg overflow-hidden",
        "bg-zinc-800 border border-[var(--color-border)]",
        "hover:border-[var(--color-primary)] hover:scale-[1.02]",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]"
      )}
    >
      {/* Image or placeholder */}
      {loading ? (
        <Skeleton className="absolute inset-0" />
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
      ) : imageData ? (
        <img
          src={imageData}
          alt={stepName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-6 w-6 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </div>
      )}

      {/* Label overlay */}
      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
        <span className="text-xs text-white truncate block">{stepName}</span>
      </div>

      {/* Index badge */}
      <span className="absolute top-1 right-1 text-xs bg-black/60 px-1.5 py-0.5 rounded text-white tabular-nums">
        {index + 1}
      </span>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/10 transition-colors" />
    </button>
  );
}
