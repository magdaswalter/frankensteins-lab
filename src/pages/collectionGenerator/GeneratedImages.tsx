import React from "react";
import { Button, Grid } from "@mui/material";

interface GeneratedImage {
  id: number;
  imageURL: string;
}

interface GeneratedImagesProps {
  images: GeneratedImage[];
}

const GeneratedImages = ({ images }: GeneratedImagesProps) => {
  const handleDownloadImages = () => {
    // Logic to download the generated images
  };

  return (
    <Grid container spacing={2}>
      {images.length > 0 && (
        <>
          <Grid item xs={12} style={{ height: "500px", overflowY: "auto" }}>
            <Grid container spacing={2}>
              {images.map((image) => (
                <Grid item xs={6} key={image.id}>
                  <img src={image.imageURL} alt={`${image.id}`} />
                </Grid>
              ))}
            </Grid>
          </Grid>
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

export default GeneratedImages;
