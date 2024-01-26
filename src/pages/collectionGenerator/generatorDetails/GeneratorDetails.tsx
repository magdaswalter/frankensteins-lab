import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { DndProvider } from "react-dnd";
import LayerOrder from "./LayerOrder";
import RarityPercentage from "./RarityPercentage";
import { HTML5Backend } from "react-dnd-html5-backend";
import { countImageCombinations } from "./PossibleImageCombinations";

export interface GeneratedImage {
  id: number;
  imageURL: string;
}

interface MainFolderPercentages {
  [key: string]: number;
}

interface GeneratorProps {
  filePaths: FileWithPath[];
  folderNames: {
    mainFolders: string[];
    rarityFolders: string[];
  };
  setGeneratedImages: (generatedImages: GeneratedImage[]) => void;
}

const GeneratorDetails = ({
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

  const tempMainFolderPercentages = useRef<MainFolderPercentages>(
    folderNames.mainFolders.reduce(
      (acc: MainFolderPercentages, folder: string) => {
        acc[folder] = 100;
        return acc;
      },
      {}
    )
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
      const reorderedPaths = reorderFilePaths();
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
        (progress) => setProgress(progress),
        tempMainFolderPercentages.current
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
                  <LayerOrder
                    mainFolders={mainFolders}
                    moveFolder={moveFolder}
                    selectedMainFolders={selectedMainFolders}
                    toggleFolderSelection={toggleFolderSelection}
                    tempMainFolderPercentages={tempMainFolderPercentages}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RarityPercentage />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container>
                <Grid item width="100%">
                  <Grid
                    container
                    gap={1}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Grid item md={3}>
                      <Typography>
                        Maximum Unique Image Combination:{" "}
                      </Typography>
                      <Typography fontSize={16} fontWeight="bold">
                        {countImageCombinations(filePaths)}
                      </Typography>
                    </Grid>
                    <Grid item md={2}>
                      <label htmlFor="numOfImages">Number of Images:</label>
                    </Grid>
                    <Grid item md={2}>
                      <input
                        type="number"
                        id="numOfImages"
                        value={numOfImages}
                        onChange={(e) =>
                          setNumOfImages(parseInt(e.target.value, 10))
                        }
                      />
                    </Grid>
                    <Grid item md={2}>
                      <Button
                        variant="contained"
                        onClick={handleGenerateImages}
                        disabled={loading}
                      >
                        Generate Images
                      </Button>
                    </Grid>
                  </Grid>
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

export default GeneratorDetails;
