import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import { FileWithPath } from "react-dropzone";
import { combineImages } from "./ImageCombiner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface GeneratedImage {
  id: number;
  imageURL: string;
}

interface GeneratorProps {
  filePaths: FileWithPath[];
  mainFolders: string[];
  setGeneratedImages: (generatedImages: GeneratedImage[]) => void;
}

const Generator = ({
  filePaths,
  mainFolders,
  setGeneratedImages,
}: GeneratorProps) => {
  const [numOfImages, setNumOfImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [folders, setFolders] = useState(mainFolders);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const reorderFilePaths = useCallback(() => {
    const reorderedFilePaths: FileWithPath[] = [];

    const folderMap = new Map<string, FileWithPath[]>();
    filePaths.forEach((filePath) => {
      if (filePath?.path) {
        const mainFolder = filePath.path.split("/")[2];
        if (!folderMap.has(mainFolder)) {
          folderMap.set(mainFolder, []);
        }
        folderMap.get(mainFolder)!.push(filePath);
      }
    });

    folders.forEach((folder) => {
      if (folderMap.has(folder)) {
        const folderFiles = folderMap.get(folder);
        if (folderFiles) {
          reorderedFilePaths.push(...folderFiles);
        }
      }
    });

    return reorderedFilePaths;
  }, [filePaths, folders]);

  const generatePreviewImage = useCallback(async () => {
    try {
      const reorderedPaths = reorderFilePaths(); // Use the reordered file paths
      const previewImageURL = await combineImages(reorderedPaths, 1);
      setPreviewImage(previewImageURL[0]);
    } catch (error) {
      console.error("Failed to generate preview image:", error);
    }
  }, [reorderFilePaths]);

  useEffect(() => {
    if (filePaths.length > 0) {
      generatePreviewImage();
    }
  }, [filePaths, folders, generatePreviewImage]);

  useEffect(() => {
    if (filePaths.length > 0) {
      generatePreviewImage();
    }
  }, [filePaths, generatePreviewImage]);

  const handleGenerateImages = async () => {
    try {
      setLoading(true);
      setProgress(0);
      setGenerationComplete(false);

      const reorderedPaths = reorderFilePaths();
      const combinedImageURLs = await combineImages(
        reorderedPaths,
        numOfImages,
        (progress) => setProgress(progress)
      );
      const combinedImages = combinedImageURLs.map((imageURL, i) => ({
        id: i,
        imageURL,
      }));
      setGeneratedImages(combinedImages);
      setGenerationComplete(true);
    } catch (error) {
      console.error("Failed to generate images:", error);
    } finally {
      setLoading(false);
    }
  };

  interface FolderItemProps {
    id: string;
    folder: string;
    index: number;
    moveFolder: (dragIndex: number, hoverIndex: number) => void;
  }

  interface DragItem {
    index: number;
    id: string;
  }
  const FolderItem = ({ id, folder, index, moveFolder }: FolderItemProps) => {
    const [, drag] = useDrag(
      () => ({
        type: "folder",
        item: { id, index },
      }),
      [id, index]
    );

    const [, drop] = useDrop(
      () => ({
        accept: "folder",
        hover(item: DragItem, monitor) {
          if (item.index !== index) {
            moveFolder(item.index, index);
            item.index = index;
          }
        },
      }),
      [index, moveFolder]
    );

    return (
      <Grid ref={(node) => drag(drop(node))} item style={getItemStyle()}>
        {folder}
      </Grid>
    );
  };

  const moveFolder = (dragIndex: number, hoverIndex: number) => {
    const dragFolder = folders[dragIndex];
    const newFolders = Array.from(folders);
    newFolders.splice(dragIndex, 1);
    newFolders.splice(hoverIndex, 0, dragFolder);
    setFolders(newFolders);
  };

  const getItemStyle = (): React.CSSProperties => ({
    userSelect: "none",
    padding: 8,
    margin: `0 0 8px 0`,
    background: "lightgrey",
    color: "black",
    cursor: "pointer",
    fontSize: "20px",
  });

  const getListStyle = (): React.CSSProperties => ({
    background: "lightgrey",
    padding: 8,
    width: 250,
    minHeight: 400,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container spacing={2}>
        {previewImage && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "10px" }}>
              <Typography variant="h6">Preview Image</Typography>
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <Grid container direction="column">
            <Grid item>
              <Grid container spacing={3}>
                <Grid item>
                  <label htmlFor="numOfImages">Number of Images:</label>
                  <input
                    type="number"
                    id="numOfImages"
                    value={numOfImages}
                    onChange={(e) =>
                      setNumOfImages(parseInt(e.target.value, 10))
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={handleGenerateImages}
                    disabled={loading}
                  >
                    Generate Images
                  </Button>
                </Grid>
                {loading && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <CircularProgress />
                      <Typography variant="body1" style={{ marginLeft: 10 }}>
                        Generating... {progress.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {generationComplete && (
                  <Grid item xs={12}>
                    <Typography variant="h6" style={{ color: "green" }}>
                      Image generation complete!
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item style={getListStyle()}>
              {folders.map((folder, index) => (
                <FolderItem
                  key={folder}
                  id={folder}
                  folder={folder}
                  index={index}
                  moveFolder={moveFolder}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DndProvider>
  );
};

export default Generator;
