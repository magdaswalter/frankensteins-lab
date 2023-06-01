import { FileWithPath } from "react-dropzone";

const combineImages = (filePaths: FileWithPath[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const imageCombiner = document.createElement("canvas");

    // Set the desired dimensions of the combined image
    imageCombiner.width = 800;
    imageCombiner.height = 600;

    const context = imageCombiner.getContext("2d");

    const uniqueFolders = new Set<string>();

    filePaths.forEach((file) => {
      if (file.path) {
        const [folder] = file.path.split("/");
        uniqueFolders.add(folder);
      }
    });

    const folderOrder = Array.from(uniqueFolders);
    const subfolders: { [key: string]: string[] } = {};

    folderOrder.forEach((folder) => {
      const matchingFiles = filePaths.filter((file) => {
        if (file.path) {
          const [currentFolder] = file.path.split("/");
          return currentFolder === folder;
        }
        return false;
      });

      subfolders[folder] = matchingFiles.map((file) => file.path || "");
    });

    const loadImage = (filePath: FileWithPath): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(filePath);
      });
    };

    const combineNextImage = async () => {
      if (folderOrder.length === 0) {
        // No more folders to combine, resolve with the combined image URL
        const combinedImageURL = imageCombiner.toDataURL();
        resolve(combinedImageURL);
        return;
      }

      const currentFolder = folderOrder.shift() as string;
      const currentSubfolders = subfolders[currentFolder];

      await Promise.all(
        currentSubfolders.map(async (subfolder) => {
          const matchingFilePath = filePaths.find(
            (file) => file.path === subfolder
          );

          if (matchingFilePath) {
            const image = await loadImage(matchingFilePath);

            // Draw the image onto the canvas
            context?.drawImage(
              image,
              0,
              0,
              imageCombiner.width,
              imageCombiner.height
            );
          }
        })
      );

      // Combine the next image
      combineNextImage();
    };

    // Start combining images
    combineNextImage();
  });
};

export { combineImages };
