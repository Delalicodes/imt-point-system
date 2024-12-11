import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  messageAttachment: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "8MB" },
    video: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      // Verify user is authenticated
      return { userId: "user_id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url, name: file.name };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
