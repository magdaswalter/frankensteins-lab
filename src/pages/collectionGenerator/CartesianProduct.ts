import { FileWithPath } from "react-dropzone";

export const CartesianProduct = (
  arrays: FileWithPath[][]
): FileWithPath[][] => {
  const product = arrays.reduce<FileWithPath[][]>(
    (acc, files) => {
      const combined = acc.flatMap((accFiles) =>
        files.map((file) => [...accFiles, file])
      );
      return combined;
    },
    [[]]
  );
  return product;
};
