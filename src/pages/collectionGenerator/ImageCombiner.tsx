import { FileWithPath } from "react-dropzone";
import { CartesianProduct } from "./CartesianProduct";

const combineImages = (filePaths: FileWithPath[]): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    const organizedFiles: {
      [key: string]: FileWithPath[];
    } = {};

    filePaths.forEach((file) => {
      if (file.path) {
        const pathParts = file.path.split("/").filter((p) => p);
        if (pathParts.length >= 3) {
          const key = pathParts.slice(0, 2).join("/");
          organizedFiles[key] = organizedFiles[key] || [];
          organizedFiles[key].push(file);
        }
      }
    });

    const loadImage = (file: FileWithPath): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(file);
      });

    const combinationsInput = Object.values(organizedFiles);

    const allCombinations = CartesianProduct(combinationsInput);

    const combinedImages: string[] = [];

    for (const combination of allCombinations) {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const context = canvas.getContext("2d");

      for (const file of combination) {
        const image = await loadImage(file);
        context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      }

      combinedImages.push(canvas.toDataURL());
    }

    resolve(combinedImages);
  });
};

export { combineImages };
