import { FileWithPath } from "react-dropzone";
import { MetadataObject } from "./GenerateMetadata";
import { GeneratedImage } from "./GeneratorDetails";

const GenerateImages = (
  metadata: MetadataObject[],
  progressCallback: (progress: number) => void
): Promise<GeneratedImage[]> => {
  return new Promise(async (resolve, reject) => {
    const loadImage = (fileWithPath: FileWithPath): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(new Error(`Failed to load image ${fileWithPath.path}`));
        img.src = URL.createObjectURL(fileWithPath);
      });

    const generatedImages: GeneratedImage[] = [];

    for (let metaIndex = 0; metaIndex < metadata.length; metaIndex++) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      let canvasInitialized = false;
      const attributes = metadata[metaIndex].attributes;

      for (let attrIndex = 0; attrIndex < attributes.length; attrIndex++) {
        // Directly using the FileWithPath object from attribute's path
        const fileWithPath = attributes[attrIndex].path;

        const img = await loadImage(fileWithPath).catch(reject);

        if (!img) continue;

        if (!canvasInitialized) {
          canvas.width = img.width;
          canvas.height = img.height;
          canvasInitialized = true;
        }

        context.drawImage(img, 0, 0, img.width, img.height);
      }

      if (canvasInitialized) {
        generatedImages.push({ id: metaIndex, imageURL: canvas.toDataURL() });

        if (progressCallback) {
          const progressPercentage = ((metaIndex + 1) / metadata.length) * 100;
          progressCallback(progressPercentage);
        }
      }
    }

    resolve(generatedImages);
  });
};

export { GenerateImages };
