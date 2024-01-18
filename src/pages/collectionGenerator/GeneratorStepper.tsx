import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  styled,
} from "@mui/material";
import FolderUploader from "./FolderUploader";
import { FileWithPath } from "react-dropzone";
import Generator, { GeneratedImage } from "./Generator";
import GeneratedImages from "./GeneratedImages";

const StyledStepper = styled(Stepper)(() => ({}));

const steps = [
  "Collection Details",
  "Upload",
  "Generator Details",
  "Generated Images",
  "Upload Generated Collection",
  "Deploy",
];

const GeneratorStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [filePaths, setFilePaths] = useState<FileWithPath[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [mainFolders, setMainFolders] = useState<string[]>([]);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSetFilePaths = (files: FileWithPath[]) => {
    setFilePaths(files);
  };

  const handleOnMainFoldersExtracted = (mainFolders: string[]) => {
    setMainFolders(mainFolders);
  };

  const handleSetGeneratedImages = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
  };
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      width="calc(100% - 80px)"
      padding={2}
    >
      <Grid item width={"100%"}>
        <StyledStepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </StyledStepper>
      </Grid>
      {activeStep === steps.length ? (
        <Grid item xs={12} textAlign="center">
          <Typography variant="h5">All steps completed</Typography>
          <Button onClick={() => setActiveStep(0)}>Reset</Button>
        </Grid>
      ) : (
        <Grid item width={"100%"} textAlign="center">
          <Typography variant="h5">{steps[activeStep]}</Typography>
          {/* Render the content of each step */}
          {activeStep === 0 && <CollectionDetails />}
          {activeStep === 1 && (
            <FolderUploader
              onFilesAdded={handleSetFilePaths}
              onMainFoldersExtracted={handleOnMainFoldersExtracted}
            />
          )}
          {activeStep === 2 && (
            <Generator
              mainFolders={mainFolders}
              filePaths={filePaths}
              setGeneratedImages={handleSetGeneratedImages}
            />
          )}
          {activeStep === 3 && <GeneratedImages images={generatedImages} />}
          {activeStep === 4 && <UploadGeneratedCollection />}
          {activeStep === 5 && <Deploy />}
          <Grid item xs={12} mt={3}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" color="primary" onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

const CollectionDetails = () => {
  return (
    <Grid item xs={12}>
      {/* Add your Collection Details component here */}
    </Grid>
  );
};

const UploadGeneratedCollection = () => {
  return (
    <Grid item xs={12}>
      {/* Add your Upload Generated Collection component here */}
    </Grid>
  );
};

const Deploy = () => {
  return (
    <Grid item xs={12}>
      {/* Add your Deploy component here */}
    </Grid>
  );
};

export default GeneratorStepper;
