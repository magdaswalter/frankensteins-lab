import { FileWithPath } from "react-dropzone";

const combineImages = (
  filePaths: FileWithPath[],
  numOfImages: number,
  progressCallback?: (progress: number) => void,
  folderPercentages?: { [key: string]: number }
): Promise<string[]> => {
  console.log(folderPercentages);
  return new Promise(async (resolve, reject) => {
    const organizedFiles: { [key: string]: FileWithPath[] } = {};
    filePaths.forEach((file) => {
      if (file.path) {
        const pathParts = file.path.split("/").filter((p) => p);
        if (pathParts.length >= 3) {
          const folderName = pathParts[1];
          organizedFiles[folderName] = organizedFiles[folderName] || [];
          organizedFiles[folderName].push(file);
        }
      }
    });

    const loadImage = (file: FileWithPath): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(file);
      });

    const combinedImages: string[] = [];

    for (let imgIndex = 0; imgIndex < numOfImages; imgIndex++) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      let canvasInitialized = false;

      for (const [folderName, files] of Object.entries(organizedFiles)) {
        const probability = folderPercentages?.[folderName] ?? 100;
        if (Math.random() * 100 < probability) {
          const fileIndex = imgIndex % files.length;
          const img = await loadImage(files[fileIndex]);

          if (!canvasInitialized) {
            canvas.width = img.width;
            canvas.height = img.height;
            canvasInitialized = true;
          }

          context.drawImage(img, 0, 0, img.width, img.height);
        }
      }

      if (canvasInitialized) {
        combinedImages.push(canvas.toDataURL());

        if (progressCallback) {
          const progressPercentage =
            (combinedImages.length / numOfImages) * 100;
          progressCallback(progressPercentage);
        }
      }
    }

    resolve(combinedImages.slice(0, numOfImages));
  });
};

export { combineImages };
