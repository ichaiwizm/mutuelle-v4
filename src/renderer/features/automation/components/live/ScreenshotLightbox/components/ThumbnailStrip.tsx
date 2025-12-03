import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Screenshot } from "../types";

// Cache for thumbnail images
const thumbnailCache = new Map<string, string>();

interface ThumbnailProps {
  path: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function Thumbnail({ path, isActive, onClick, index }: ThumbnailProps) {
  const [imageData, setImageData] = useState<string | null>(
    () => thumbnailCache.get(path) ?? null
  );
  const [loading, setLoading] = useState(false);
  const hasTriedLoading = useRef(false);

  useEffect(() => {
    if (imageData || hasTriedLoading.current) return;

    const loadThumbnail = async () => {
      hasTriedLoading.current = true;
      setLoading(true);
      try {
        const data = await window.api.automation.readScreenshot(path);
        if (data) {
          thumbnailCache.set(path, data);
          setImageData(data);
        }
      } catch (err) {
        console.error("Failed to load lightbox thumbnail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [path, imageData]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-16 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0",
        "bg-zinc-800",
        isActive
          ? "border-cyan-500 ring-2 ring-cyan-500/30"
          : "border-transparent hover:border-zinc-600"
      )}
    >
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-3 w-3 text-zinc-400 animate-spin" />
        </div>
      ) : imageData ? (
        <img
          src={imageData}
          alt={`Thumbnail ${index + 1}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
          {index + 1}
        </div>
      )}
    </button>
  );
}

interface ThumbnailStripProps {
  screenshots: Screenshot[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function ThumbnailStrip({ screenshots, currentIndex, onSelect }: ThumbnailStripProps) {
  if (screenshots.length <= 1) {
    return null;
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-center gap-2 overflow-x-auto py-2">
        {screenshots.map((screenshot, index) => (
          <Thumbnail
            key={screenshot.path}
            path={screenshot.path}
            isActive={index === currentIndex}
            onClick={() => onSelect(index)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
