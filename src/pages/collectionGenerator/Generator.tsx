import React, { useState } from "react";
import { Button, Grid, Typography } from "@mui/material";
import { FileWithPath } from "react-dropzone";
import { combineImages } from "./ImageCombiner";

interface GeneratedImage {
  id: number;
  imageURL: string;
}

interface GeneratorProps {
  filePaths: FileWithPath[];
}

const Generator: React.FC<GeneratorProps> = ({ filePaths }) => {
  const [numOfImages, setNumOfImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerateImages = async () => {
    const combinedImages: GeneratedImage[] = [];

    for (let i = 0; i < numOfImages; i++) {
      try {
        const combinedImageURL = await combineImages(filePaths);
        combinedImages.push({ id: i, imageURL: combinedImageURL });
      } catch (error) {
        console.error("Failed to generate images:", error);
      }
    }

    setGeneratedImages(combinedImages);
  };

  const handleDownloadImages = () => {
    // Logic to download the generated images
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
        <Button variant="contained" onClick={handleGenerateImages}>
          Generate Images
        </Button>
      </Grid>
      {generatedImages.length > 0 && (
        <>
          <Grid item xs={12}>
            <Typography variant="h6">Generated Images:</Typography>
          </Grid>
          {generatedImages.map((image) => (
            <Grid item xs={6} key={image.id}>
              {/* <img src={image.imageURL} alt={`Generated Image ${image.id}`} /> */}
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleDownloadImages}>
              Download Images
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Generator;
