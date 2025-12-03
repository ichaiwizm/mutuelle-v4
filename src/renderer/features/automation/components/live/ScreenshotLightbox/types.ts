export type Screenshot = {
  path: string;
  stepName: string;
  stepId: string;
};

export type ScreenshotLightboxProps = {
  screenshots: Screenshot[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};
