import { MainFolder } from "../upload/FolderUploader";
import { FileWithPath } from "react-dropzone";

interface Attribute {
  trait_type: string;
  value: string;
}

interface MetadataObject {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

export const generateMetadata = (
  folders: { mainFolders: MainFolder[] },
  filePaths: FileWithPath[],
  numOfImages: number
): MetadataObject[] => {
  const metadataObjects: MetadataObject[] = [];

  const generateUniqueMetadata = (): MetadataObject => {
    while (true) {
      const attributes: Attribute[] = [];
      folders.mainFolders.forEach((folder) => {
        if (Math.random() < folder.percentage / 100) {
          const rarityFolder =
            folder.rarityFolders[
              Math.floor(Math.random() * folder.rarityFolders.length)
            ];
          const relevantFilePaths = filePaths.filter(
            (file) =>
              file.path &&
              file.path.includes(`/${folder.name}/${rarityFolder.name}/`)
          );
          if (relevantFilePaths.length > 0) {
            const selectedFile =
              relevantFilePaths[
                Math.floor(Math.random() * relevantFilePaths.length)
              ];
            if (selectedFile && selectedFile.path) {
              const value =
                selectedFile.path.split("/").pop()?.split(".").shift() || "";
              attributes.push({ trait_type: folder.name, value });
            }
          }
        }
      });

      if (
        !metadataObjects.some(
          (obj) => JSON.stringify(obj.attributes) === JSON.stringify(attributes)
        )
      ) {
        const id = metadataObjects.length + 1;
        return {
          name: `Frankensteins lab #${id}`,
          description: `Frankensteins lab #${id} - Generated and deployed with Frankensteins lab.`,
          image: `/Frankensteins_lab#${id}.jpeg`,
          attributes,
        };
      }
    }
  };

  for (let i = 0; i < numOfImages; i++) {
    metadataObjects.push(generateUniqueMetadata());
  }

  return metadataObjects;
};
