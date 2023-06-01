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
import Generator from "./Generator";

const StyledStepper = styled(Stepper)(() => ({}));

const steps = [
  "Collection Details",
  "Upload",
  "Generator Details",
  "Upload Generated Collection",
  "Deploy",
];

const GeneratorStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [filePaths, setFilePaths] = useState<FileWithPath[]>([]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSetFilePaths = (files: FileWithPath[]) => {
    setFilePaths(files);
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
          {/* Render the content of each step */}
          {activeStep === 0 && <CollectionDetails />}
          {activeStep === 1 && <Upload setFilePaths={handleSetFilePaths} />}
          {activeStep === 2 && <GeneratorDetails filePaths={filePaths} />}
          {activeStep === 3 && <UploadGeneratedCollection />}
          {activeStep === 4 && <Deploy />}
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

interface UploadProps {
  setFilePaths: (files: FileWithPath[]) => void;
}

const Upload = ({ setFilePaths }: UploadProps) => {
  const handleFolderUpload = (files: FileWithPath[]) => {
    setFilePaths(files);
  };

  return (
    <Grid item width={"100%"}>
      <FolderUploader onFilesAdded={handleFolderUpload} />
    </Grid>
  );
};

interface GeneratorDetailsProps {
  filePaths: FileWithPath[];
}

const GeneratorDetails = ({ filePaths }: GeneratorDetailsProps) => {
  return (
    <Grid item width={"100%"}>
      <Generator filePaths={filePaths} />
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
