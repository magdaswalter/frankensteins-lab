import React, { useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import { Grid, Typography, Box } from "@mui/material";

interface FolderUploaderProps {
  onFilesAdded: (files: FileWithPath[]) => void;
  onFolderNamesExtracted: (folderNames: {
    mainFolders: string[];
    rarityFolders: string[];
  }) => void;
}

const FolderUploader = ({
  onFilesAdded,
  onFolderNamesExtracted,
}: FolderUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
  const [folderDropped, setFolderDropped] = useState<boolean>(false);

  const traverseFolder = (entry: any, path: string) => {
    const reader = entry.createReader();
    const readEntries = () => {
      reader.readEntries((entries: any[]) => {
        if (entries.length > 0) {
          entries.forEach((subEntry: any) => {
            if (subEntry.isDirectory) {
              traverseFolder(subEntry, `${path}/${subEntry.name}`);
            } else {
              subEntry.file((file: File) => {
                const fileWithPath: FileWithPath = {
                  ...file,
                  path: `${path}/${subEntry.name}`,
                };
                setSelectedFiles((prevFiles) => [...prevFiles, fileWithPath]);
                onFilesAdded([...selectedFiles, fileWithPath]);
              });
            }
          });
          readEntries();
        }
      });
    };

    readEntries();
  };

  const extractFolderNames = (filePath: string) => {
    const parts = filePath.split("/");
    const mainFolder = parts.length > 2 ? parts[2] : "";
    const rarityFolder = parts.length > 3 ? parts[3] : "";
    return { mainFolder, rarityFolder };
  };

  const onDrop = async (acceptedFiles: FileWithPath[]) => {
    setFolderDropped(true);

    const fileArray: FileWithPath[] = [];
    const updatedMainFolders = new Set<string>();
    const updatedRarityFolders = new Set<string>();

    for (const file of acceptedFiles) {
      if (file.type === "application/x-moz-folder") {
        const entries = await (file as any)
          .webkitGetAsEntry()
          .createReader()
          .readEntries();
        entries.forEach((entry: any) => {
          if (entry.isDirectory) {
            traverseFolder(entry, file.name);
          }
        });
      } else {
        const { mainFolder, rarityFolder } = extractFolderNames(
          file.path ? file.path : ""
        );

        updatedMainFolders.add(mainFolder);
        updatedRarityFolders.add(rarityFolder);
        fileArray.push(file as FileWithPath);
      }
    }

    onFolderNamesExtracted({
      mainFolders: Array.from(updatedMainFolders),
      rarityFolders: Array.from(updatedRarityFolders),
    });

    setSelectedFiles((prevFiles) => [...prevFiles, ...fileArray]);
    onFilesAdded([...selectedFiles, ...fileArray]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    onDragEnter: () => setFolderDropped(false),
  });

  const dropzoneClassName = isDragActive
    ? "folder-uploader-dropzone active"
    : "folder-uploader-dropzone";

  const renderMessage = () => {
    if (folderDropped) {
      return "Folder has been uploaded";
    } else if (isDragActive) {
      return "Drop the folder here";
    } else {
      return "Drag and drop a folder here or click to select";
    }
  };

  return (
    <Grid container spacing={2} justifyContent={"center"}>
      <Grid item xs={12}>
        <Typography variant="h6">Drag and drop a folder here</Typography>
      </Grid>
      <Grid
        item
        sx={{
          width: "700px",
        }}
      >
        <Box
          {...getRootProps()}
          className={dropzoneClassName}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            bgcolor: isDragActive ? "#e0e0e0" : "#f0f0f0",
            borderRadius: 8,
            boxShadow: isDragActive ? 2 : 0,
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            "&:hover": {
              bgcolor: "#e0e0e0",
            },
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body1">{renderMessage()}</Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FolderUploader;
