"use client";

import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface UploadProviderProps {
  endpoint: keyof OurFileRouter;
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
}

export const UploadProvider = ({
  endpoint,
  onClientUploadComplete,
  onUploadError
}: UploadProviderProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={onClientUploadComplete}
      onUploadError={onUploadError}
    />
  );
};
