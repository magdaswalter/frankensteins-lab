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
import FolderUploader, { MainFolder } from "./upload/FolderUploader";
import { FileWithPath } from "react-dropzone";
import GeneratorDetails, {
  GeneratedImage,
} from "./generatorDetails/GeneratorDetails";
import GeneratedImages from "./generatedImages/GeneratedImages";

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
  const [folders, setFolders] = useState<{
    mainFolders: MainFolder[];
  }>({ mainFolders: [] });
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSetFilePaths = (files: FileWithPath[]) => {
    setFilePaths(files);
  };

  const onSetFolders = (folders: { mainFolders: MainFolder[] }) => {
    setFolders(folders);
  };

  const handleSetGeneratedImages = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      width="100%"
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
          {activeStep === 0 && <CollectionDetails />}
          {activeStep === 1 && (
            <FolderUploader
              onFilesAdded={handleSetFilePaths}
              onFoldersExtracted={onSetFolders}
            />
          )}
          {activeStep === 2 && (
            <GeneratorDetails
              folders={folders}
              onSetFolders={onSetFolders}
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
