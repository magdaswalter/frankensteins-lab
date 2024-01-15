import React, { useState } from "react";
import { Button, Grid, Typography, CircularProgress, Box } from "@mui/material";
import { FileWithPath } from "react-dropzone";
import { combineImages } from "./ImageCombiner"; // Adjust the import path as needed

export interface GeneratedImage {
  id: number;
  imageURL: string;
}

interface GeneratorProps {
  filePaths: FileWithPath[];
  setGeneratedImages: (generatedImages: GeneratedImage[]) => void;
}

const Generator: React.FC<GeneratorProps> = ({
  filePaths,
  setGeneratedImages,
}) => {
  const [numOfImages, setNumOfImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);

  const handleGenerateImages = async () => {
    try {
      setLoading(true);
      setProgress(0);
      setGenerationComplete(false);

      const combinedImageURLs = await combineImages(
        filePaths,
        numOfImages,
        (progress) => setProgress(progress)
      );

      const combinedImages = combinedImageURLs.map((imageURL, i) => ({
        id: i,
        imageURL: imageURL,
      }));

      setGeneratedImages(combinedImages);
      setGenerationComplete(true);
    } catch (error) {
      console.error("Failed to generate images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">Image Generator</Typography>
      </Grid>
      <Grid item xs={6}>
        <label htmlFor="numOfImages">Number of Images:</label>
        <input
          type="number"
          id="numOfImages"
          value={numOfImages}
          onChange={(e) => setNumOfImages(parseInt(e.target.value))}
        />
      </Grid>
      <Grid item xs={6}>
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
  );
};

export default Generator;
