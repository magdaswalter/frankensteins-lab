import React, { useState } from "react";
import {
  Grid,
  Typography,
  Select,
  MenuItem,
  Input,
  FormControl,
} from "@mui/material";
import { MainFolder } from "../upload/FolderUploader";

interface RarityPercentageProps {
  folders: {
    mainFolders: MainFolder[];
  };
}

const RarityPercentage = ({ folders }: RarityPercentageProps) => {
  const [selectedMainFolder, setSelectedMainFolder] = useState(
    folders.mainFolders[0].name || ""
  );

  // const handleRarityChange = (folder: string, value: number) => {
  //   setRarityPercentages({ ...rarityPercentages, [folder]: value });
  // };

  return (
    <Grid container direction="column" rowGap={2} alignItems="center">
      <Grid item>
        <Typography fontSize={22}>Rarity percentage</Typography>
      </Grid>
      <Grid item>
        <FormControl fullWidth>
          <Select
            value={selectedMainFolder}
            onChange={(e) => setSelectedMainFolder(e.target.value)}
            label="Main Folder"
          >
            {/* {folders.mainFolders.map((folder, index) => (
              <MenuItem key={index} value={folder}>
                <div></div>
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        {/* {folders.rarityFolders.map((folder, index) => (
          <Grid
            key={index}
            container
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>{folder}:</Typography>
            <Input
              type="number"
              value={rarityPercentages[folder]}
              onChange={(e) =>
                handleRarityChange(folder, parseFloat(e.target.value))
              }
              inputProps={{ min: 0, max: 100, step: 5 }}
            />
          </Grid>
        ))} */}
      </Grid>
    </Grid>
  );
};

export default RarityPercentage;
