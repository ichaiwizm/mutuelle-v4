import { Loader2 } from "lucide-react";

interface ImageViewerProps {
  imageData: string | null;
  loading: boolean;
  error: string | null;
  zoom: number;
  altText: string;
}

export function ImageViewer({ imageData, loading, error, zoom, altText }: ImageViewerProps) {
  return (
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
          alt={altText}
          className="max-w-none transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        />
      ) : null}
    </div>
  );
}
