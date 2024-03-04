import { FileWithPath } from "react-dropzone";

const GeneratePreviewImage = (
  filePaths: FileWithPath[],
  mainFolderNames: string[]
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const loadImage = (file: FileWithPath): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    let canvasInitialized = false;
    for (const folderName of mainFolderNames) {
      const file = filePaths.find(
        (f) => f.path && f.path.includes(`/${folderName}/`)
      );
      if (file) {
        const img = await loadImage(file);

        if (!canvasInitialized) {
          canvas.width = img.width;
          canvas.height = img.height;
          canvasInitialized = true;
        }

        context.drawImage(img, 0, 0);
      }
    }

    if (canvasInitialized) {
      const dataUrl = canvas.toDataURL();
      resolve(dataUrl);
    } else {
      reject(new Error("No images were processed."));
    }
  });
};

export { GeneratePreviewImage };
