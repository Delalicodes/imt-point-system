import { createUploadthing } from "uploadthing/next";
import { UploadButton, UploadDropzone, Uploader, useUploadThing } from "@uploadthing/react";
 
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export { UploadButton, UploadDropzone, Uploader, useUploadThing };

export const uploadThing = createUploadthing();
