import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import JSZip from "jszip";
import { FileWithPath } from "react-dropzone";
import { GenerateImages } from "./GenerateImages";
import { DndProvider } from "react-dnd";
import LayerOrder from "./LayerOrder";
import RarityPercentage from "./RarityPercentage";
import { HTML5Backend } from "react-dnd-html5-backend";
import { countImageCombinations } from "./PossibleImageCombinations";
import { MainFolder } from "../upload/FolderUploader";
import { GeneratePreviewImage } from "./GeneratePreviewImage";
import { MetadataObject, generateMetadata } from "./GenerateMetadata";

export interface GeneratedImage {
  id: number;
  imageURL: string;
}

interface GeneratorProps {
  filePaths: FileWithPath[];
  folders: {
    mainFolders: MainFolder[];
  };
  onSetFolders: (folders: { mainFolders: MainFolder[] }) => void;
  setGeneratedImagesCallback: (generatedImages: GeneratedImage[]) => void;
}

const GeneratorDetails = ({
  filePaths,
  folders,
  onSetFolders,
  setGeneratedImagesCallback,
}: GeneratorProps) => {
  const [numOfImages, setNumOfImages] = useState(1);
  const [generatedMetadata, setGeneratedMetadata] = useState<MetadataObject[]>(
    []
  );
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [progressImageCombiner, setProgressImageCombiner] = useState(0);
  const [generationCollectionComplete, setGenerationCollectionComplete] =
    useState(false);
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
    folders.mainFolders.forEach((mainFolder) => {
      if (folderMap.has(mainFolder.name)) {
        const folderFiles = folderMap.get(mainFolder.name);
        if (folderFiles) {
          reorderedFilePaths.push(...folderFiles);
        }
      }
    });
    return reorderedFilePaths.filter((filePath) => {
      const mainFolder = filePath.path?.split("/")[2] ?? "";
      return folders.mainFolders.some(
        (folder) => folder.name === mainFolder && folder.selected
      );
    });
  }, [filePaths, folders.mainFolders]);

  const generatePreviewImage = useCallback(async () => {
    try {
      const reorderedPaths = reorderFilePaths();
      const previewImageURL = await GeneratePreviewImage(
        reorderedPaths,
        folders.mainFolders.map((folder) => folder.name)
      );
      setPreviewImage(previewImageURL);
    } catch (error) {
      console.error("Failed to generate preview image:", error);
    }
  }, [folders, reorderFilePaths]);

  useEffect(() => {
    generatePreviewImage();
  }, [generatePreviewImage]);

  useEffect(() => {
    if (filePaths.length > 0) {
      generatePreviewImage();
    }
  }, [filePaths, folders.mainFolders, generatePreviewImage]);

  useEffect(() => {
    if (filePaths.length > 0) {
      generatePreviewImage();
    }
  }, [filePaths, generatePreviewImage]);

  const handleGenerateMetadata = async () => {
    setLoadingCollection(true);
    setGeneratingMetadata(true);
    const reorderedPaths = reorderFilePaths();
    try {
      await generateMetadata(
        folders,
        reorderedPaths,
        numOfImages,
        () => {
          console.log("nomoreattempts");
        },
        (generatingMetadata) => setGeneratingMetadata(generatingMetadata),
        (generatedMetadata) => setGeneratedMetadata(generatedMetadata)
      );
    } catch (error) {
      console.error("Failed to generate the metadata:", error);
      setLoadingCollection(false);
      setGeneratingMetadata(false);
    } finally {
      setGeneratingMetadata(false);
    }
  };

  const handleGenerateImages = useCallback(async () => {
    try {
      const combinedImages = await GenerateImages(
        generatedMetadata,
        (progressImageCombiner) =>
          setProgressImageCombiner(progressImageCombiner)
      );
      setGeneratedImages(combinedImages);
      setGeneratedImagesCallback(combinedImages);
    } catch (error) {
      console.error("Failed to generate the images:", error);
      setLoadingCollection(false);
    } finally {
      setGenerationCollectionComplete(true);
      setLoadingCollection(false);
    }
  }, [generatedMetadata, setGeneratedImagesCallback]);

  const handleDownloadCollection = async () => {
    const zip = new JSZip();

    const metadataFolder = zip.folder("generated-metadata");

    if (!metadataFolder) {
      console.error("Failed to create metadata folder in zip.");
      return;
    }

    generatedMetadata.forEach((metadata, index) => {
      metadataFolder.file(
        `Frankensteins-lab-meta${index + 1}.json`,
        JSON.stringify(metadata)
      );
    });

    const imagesFolder = zip.folder("generated-images");

    if (!imagesFolder) {
      console.error("Failed to create images folder in zip.");
      return;
    }

    for (let i = 0; i < generatedImages.length; i++) {
      const imageUrl = generatedImages[i].imageURL;
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          console.error(`Failed to fetch image: ${imageUrl}`);
          continue;
        }
        const blob = await response.blob();
        imagesFolder.file(`Frankensteins-lab-image${i + 1}.png`, blob);
      } catch (error) {
        console.error(`Failed to fetch image: ${imageUrl}`, error);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "Frankensteins-lab-generated-collection.zip";
      link.click();
    });
  };

  useEffect(() => {
    if (generatedMetadata.length > 0 && loadingCollection) {
      handleGenerateImages();
      setGenerationCollectionComplete(true);
    }
  }, [generatedMetadata, handleGenerateImages, loadingCollection]);

  const toggleFolderSelection = (folderName: string) => {
    const updatedFolders = folders.mainFolders.map((folder) => {
      if (folder.name === folderName) {
        return { ...folder, selected: !folder.selected };
      }
      return folder;
    });

    onSetFolders({ mainFolders: updatedFolders });
  };

  const moveFolder = (dragIndex: number, hoverIndex: number) => {
    const newFolders = Array.from(folders.mainFolders);
    const dragFolder = newFolders[dragIndex];
    newFolders.splice(dragIndex, 1);
    newFolders.splice(hoverIndex, 0, dragFolder);

    onSetFolders({ mainFolders: newFolders });
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
                    folders={folders}
                    onSetFolders={onSetFolders}
                    moveFolder={moveFolder}
                    toggleFolderSelection={toggleFolderSelection}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RarityPercentage
                    folders={folders}
                    onSetFolders={onSetFolders}
                  />
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
                        onClick={handleGenerateMetadata}
                        disabled={loadingCollection}
                      >
                        Generate Collection
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                {loadingCollection && (
                  <Grid item xs={12}>
                    <Grid container direction={"column"}>
                      <CircularProgress />
                      <Grid item>
                        <Box display="flex" alignItems="center">
                          {generatingMetadata ? (
                            <Typography
                              variant="body1"
                              style={{ marginLeft: 10 }}
                            >
                              Generating metadata...
                            </Typography>
                          ) : (
                            <Typography
                              variant="body1"
                              style={{ marginLeft: 10 }}
                            >
                              Metadata generation completed.
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            style={{ marginLeft: 10 }}
                          >
                            Generating images {progressImageCombiner.toFixed(2)}
                            %
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                {generationCollectionComplete && (
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item>
                        <Typography variant="h6" style={{ color: "green" }}>
                          Collection generation complete! Check the generated
                          images and the metadata by downloading it.
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          onClick={handleDownloadCollection}
                        >
                          Download Collection
                        </Button>
                      </Grid>
                    </Grid>
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
