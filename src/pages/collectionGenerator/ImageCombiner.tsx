import { FileWithPath } from "react-dropzone";

const combineImages = (
  filePaths: FileWithPath[],
  numOfImages: number
): Promise<string[]> => {
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
    const combinedImages: string[] = [];

    const generateCombination = async (
      indexArray: number[],
      maxIndices: number[]
    ): Promise<void> => {
      if (combinedImages.length >= numOfImages) {
        return; // Stop generating more combinations when the limit is reached
      }

      const combination: FileWithPath[] = indexArray.map(
        (index, i) => combinationsInput[i][index]
      );

      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const context = canvas.getContext("2d");

      for (const file of combination) {
        const image = await loadImage(file);
        context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      }

      combinedImages.push(canvas.toDataURL());

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

    const maxIndices = combinationsInput.map((files) => files.length);
    await generateCombination(
      new Array(combinationsInput.length).fill(0),
      maxIndices
    );

    resolve(combinedImages.slice(0, numOfImages));
  });
};

export { combineImages };
