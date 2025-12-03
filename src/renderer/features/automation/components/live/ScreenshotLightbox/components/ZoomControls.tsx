import { Button } from "@/renderer/components/ui/Button";
import { ZoomIn, ZoomOut, RotateCcw, Download, X } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownload: () => void;
  onClose: () => void;
  canDownload: boolean;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownload,
  onClose,
  canDownload,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Zoom controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        className="text-white hover:bg-white/10"
        disabled={zoom <= 0.5}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-white text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        className="text-white hover:bg-white/10"
        disabled={zoom >= 3}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onResetZoom}
        className="text-white hover:bg-white/10"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-zinc-600 mx-2" />

      {/* Download */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDownload}
        disabled={!canDownload}
        className="text-white hover:bg-white/10"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* Close */}
      <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
