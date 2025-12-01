import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

type Screenshot = {
  path: string;
  stepName: string;
  stepId: string;
};

type FlowScreenshotGalleryProps = {
  screenshots: Screenshot[];
  onScreenshotClick: (screenshot: Screenshot) => void;
};

export function FlowScreenshotGallery({
  screenshots,
  onScreenshotClick,
}: FlowScreenshotGalleryProps) {
  if (screenshots.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {screenshots.map((screenshot, index) => (
        <ScreenshotThumbnail
          key={screenshot.path}
          path={screenshot.path}
          stepName={screenshot.stepName}
          index={index}
          onClick={() => onScreenshotClick(screenshot)}
        />
      ))}
    </div>
  );
}
