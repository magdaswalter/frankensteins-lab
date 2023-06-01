import React from "react";
import Button from "@mui/material/Button";

interface DownloadCollectionProps {
  onDownload: () => void;
}

const DownloadCollection = ({ onDownload }: DownloadCollectionProps) => {
  const handleDownload = () => {
    onDownload();
  };

  return (
    <Button variant="contained" color="primary" onClick={handleDownload}>
      Download Generated Collections
    </Button>
  );
};

export default DownloadCollection;
