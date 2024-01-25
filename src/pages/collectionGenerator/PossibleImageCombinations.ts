import { FileWithPath } from "react-dropzone";

export const countImageCombinations = (filePaths: FileWithPath[]): number => {
  const organizedFiles: { [key: string]: { [subKey: string]: number } } = {};

  filePaths.forEach((file) => {
    if (file.path) {
      const pathParts = file.path.split("/").filter((p) => p);
      if (pathParts.length >= 3) {
        const [folder, subFolder] = pathParts;
        organizedFiles[folder] = organizedFiles[folder] || {};
        organizedFiles[folder][subFolder] =
          (organizedFiles[folder][subFolder] || 0) + 1;
      }
    }
  });

  return Object.values(organizedFiles).reduce((total, subfolders) => {
    const subfolderCounts = Object.values(subfolders);
    return (
      total *
      (subfolderCounts.length > 0
        ? subfolderCounts.reduce((product, count) => product * count, 1)
        : 0)
    );
  }, 1);
};
