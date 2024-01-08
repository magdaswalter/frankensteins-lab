import { FileWithPath } from "react-dropzone";

const combineImages = (
  filePaths: FileWithPath[],
  numOfImages: number
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    // Organize files into a structured format
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

    // Function to load an image
    const loadImage = (file: FileWithPath): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(file);
      });

    // Preparing for combinations
    const combinationsInput = Object.values(organizedFiles);
    const combinedImages: string[] = [];

    // Function to generate combinations
    const generateCombination = async (
      indexArray: number[],
      maxIndices: number[]
    ): Promise<void> => {
      if (combinedImages.length >= numOfImages) return;

      const combination: FileWithPath[] = indexArray.map(
        (index, i) => combinationsInput[i][index]
      );
      const images = await Promise.all(combination.map(loadImage));

      // Determine canvas size based on the largest image
      const canvasWidth = Math.max(...images.map((img) => img.width));
      const canvasHeight = Math.max(...images.map((img) => img.height));

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");

      if (context) {
        images.forEach((img) => {
          context.drawImage(img, 0, 0, img.width, img.height);
        });

        combinedImages.push(canvas.toDataURL());
      } else {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Increment the rightmost index and carry over if needed
      for (let i = indexArray.length - 1; i >= 0; i--) {
        if (indexArray[i] < maxIndices[i] - 1) {
          indexArray[i]++;
          return generateCombination(indexArray, maxIndices);
        } else if (i !== 0) {
          indexArray[i] = 0;
        }
      }
    };

    // Initiating combination generation
    const maxIndices = combinationsInput.map((files) => files.length);
    await generateCombination(
      new Array(combinationsInput.length).fill(0),
      maxIndices
    );

    resolve(combinedImages.slice(0, numOfImages));
  });
};

export { combineImages };
