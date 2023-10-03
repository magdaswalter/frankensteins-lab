import { Button, Grid, Typography } from "@mui/material";
import React, { useState } from "react";

const pinataApiKey =
  process.env.REACT_APP_ENV === "production"
    ? (process.env.REACT_APP_PINATA_API_KEY as string)
    : (process.env.REACT_APP_PINATA_API_KEY_LOCAL as string);
const pinataApiSecret =
  process.env.REACT_APP_ENV === "production"
    ? (process.env.REACT_APP_PINATA_API_SECRET as string)
    : (process.env.REACT_APP_PINATA_API_SECRET_LOCAL as string);

const UploadToPinata = () => {
  const [imageCid, setImageCid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const formData = new FormData();
      const file = event.target.files?.[0];
      if (!file) {
        throw new Error("No file selected");
      }

      formData.append("file", file);

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: formData,
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataApiSecret,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error uploading image to Pinata");
      }

      const data = await response.json();
      setImageCid(data.IpfsHash);
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error uploading image to Pinata");
      setImageCid(null);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Frankenstein's lab</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Please upload a photo</Typography>
      </Grid>
      <Grid item xs={12}>
        <input type="file" onChange={handleFileUpload} />
      </Grid>
      {imageCid && (
        <Grid item xs={12}>
          <Typography variant="body1">Image uploaded to Pinata:</Typography>
          <Typography variant="body1">{imageCid}</Typography>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${imageCid}`}
            height={250}
            width={250}
            alt="Uploaded to Pinata. You can find it at the following link:"
          />
          <Button
            variant="contained"
            color="primary"
            href={`https://gateway.pinata.cloud/ipfs/${imageCid}`}
          >
            Here is a link to your picture
          </Button>
        </Grid>
      )}
      {errorMessage && (
        <Grid item xs={12}>
          <Typography variant="body1" color="error">
            {errorMessage}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default UploadToPinata;
