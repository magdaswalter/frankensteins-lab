import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Checkbox,
  IconButton,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  folderNames: {
    mainFolders: string[];
    rarityFolders: string[];
  };
  setGeneratedImages: (generatedImages: GeneratedImage[]) => void;
}

const Generator = ({
  filePaths,
  folderNames,
  setGeneratedImages,
}: GeneratorProps) => {
  const [numOfImages, setNumOfImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [mainFolders, setMainFolders] = useState(folderNames.mainFolders);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedMainFolders, setSelectedMainFolders] = useState(
    new Set(folderNames.mainFolders)
  );

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

    mainFolders.forEach((folder) => {
      if (folderMap.has(folder)) {
        const folderFiles = folderMap.get(folder);
        if (folderFiles) {
          reorderedFilePaths.push(...folderFiles);
        }
      }
    });

    return reorderedFilePaths.filter((filePath) => {
      const mainFolder = filePath.path?.split("/")[2] ?? "";
      return selectedMainFolders.has(mainFolder);
    });
  }, [filePaths, mainFolders, selectedMainFolders]);

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
    generatePreviewImage();
  }, [selectedMainFolders, generatePreviewImage]);

  useEffect(() => {
    if (filePaths.length > 0) {
      generatePreviewImage();
    }
  }, [filePaths, mainFolders, generatePreviewImage]);

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
    const [, drag, preview] = useDrag(
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
      <Grid ref={(node) => drop(preview(node))} item style={getItemStyle()}>
        <Checkbox
          checked={selectedMainFolders.has(folder)}
          onChange={() => toggleFolderSelection(folder)}
        />
        <span>{folder}</span>
        <IconButton ref={drag} size="small">
          <DragIndicatorIcon />
        </IconButton>
      </Grid>
    );
  };

  const toggleFolderSelection = (folder: string) => {
    setSelectedMainFolders((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(folder)) {
        newSelected.delete(folder);
      } else {
        newSelected.add(folder);
      }
      return newSelected;
    });
  };

  const moveFolder = (dragIndex: number, hoverIndex: number) => {
    const dragFolder = mainFolders[dragIndex];
    const newFolders = Array.from(mainFolders);
    newFolders.splice(dragIndex, 1);
    newFolders.splice(hoverIndex, 0, dragFolder);
    setMainFolders(newFolders);
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
    marginBottom: "40px",
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
      <Grid
        container
        padding={4}
        sx={{ border: "3px solid grey", marginTop: "20px" }}
      >
        <Grid item xs={12} md={8}>
          <Grid container direction="column">
            <Grid item>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Grid
                    container
                    direction="column"
                    rowGap={2}
                    alignItems="center"
                  >
                    <Grid item>
                      <Typography fontSize={22}>Layer order</Typography>
                    </Grid>
                    <Grid item style={getListStyle()}>
                      {mainFolders.map((folder, index) => (
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
                <Grid item xs={12} md={6}>
                  <Grid
                    container
                    direction={"column"}
                    rowGap={2}
                    alignItems="center"
                  >
                    <Grid item>
                      <Typography fontSize={22}>Rarity percentage</Typography>
                    </Grid>
                    <Grid item>tobbi</Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container justifyContent={"center"}>
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
                      Image generation complete! Check the generated images on
                      the next step.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {previewImage && (
          <Grid item xs={12} md={4}>
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
      </Grid>
    </DndProvider>
  );
};

export default Generator;
