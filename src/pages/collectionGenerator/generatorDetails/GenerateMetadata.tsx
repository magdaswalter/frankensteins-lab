import { MainFolder, RarityFolder } from "../upload/FolderUploader";
import { FileWithPath } from "react-dropzone";

interface Attribute {
  trait_type: string;
  value: string;
  path: FileWithPath;
}

export interface MetadataObject {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

type NoMoreUniquesCallback = () => void;

export const generateMetadata = (
  folders: { mainFolders: MainFolder[] },
  filePaths: FileWithPath[],
  numOfImages: number,
  noMoreUniquesCallback: NoMoreUniquesCallback,
  generatingMetadataCallback: (generatingMetadata: boolean) => void,
  setGeneratedMetadata: (generatedMetadata: MetadataObject[]) => void
) => {
  const metadataObjects: MetadataObject[] = [];

  const chooseRarityFolder = (rarityFolders: RarityFolder[]): RarityFolder => {
    const totalRarity = rarityFolders.reduce(
      (acc, folder) => acc + folder.rarity,
      0
    );
    let randomPoint = Math.random() * totalRarity;
    for (const folder of rarityFolders) {
      randomPoint -= folder.rarity;
      if (randomPoint <= 0) {
        return folder;
      }
    }
    return rarityFolders[rarityFolders.length - 1];
  };

  const generateUniqueMetadata = (): MetadataObject | null => {
    let attempts = 0;
    const maxAttempts = 10000;

    while (true) {
      if (attempts >= maxAttempts) {
        return null;
      }

      const attributes: Attribute[] = [];

      folders.mainFolders.forEach((folder) => {
        if (folder.selected && Math.random() < folder.percentage / 100) {
          const rarityFolder = chooseRarityFolder(folder.rarityFolders);
          const relevantFiles = filePaths.filter(
            (file) =>
              file.path &&
              file.path.includes(`/${folder.name}/${rarityFolder.name}/`)
          );
          if (relevantFiles.length > 0) {
            const selectedFile =
              relevantFiles[Math.floor(Math.random() * relevantFiles.length)];
            if (selectedFile && selectedFile.path) {
              const value =
                selectedFile.path.split("/").pop()!.split(".").shift() || "";

              attributes.push({
                trait_type: folder.name,
                value,
                path: selectedFile,
              });
            }
          }
        }
      });

      attempts++;

      if (
        !metadataObjects.some(
          (obj) => JSON.stringify(obj.attributes) === JSON.stringify(attributes)
        )
      ) {
        return {
          name: `Frankensteins lab #${metadataObjects.length + 1}`,
          description: `Frankensteins lab #${
            metadataObjects.length + 1
          } - Generated and deployed with Frankensteins lab.`,
          image: `/Frankensteins_lab#${metadataObjects.length + 1}.jpeg`,
          attributes,
        };
      }
    }
  };

  for (let i = 0; i < numOfImages; i++) {
    const metadata = generateUniqueMetadata();
    if (metadata) {
      metadataObjects.push(metadata);
    } else {
      noMoreUniquesCallback();
      break;
    }
  }
  generatingMetadataCallback(false);
  setGeneratedMetadata(metadataObjects);
};
