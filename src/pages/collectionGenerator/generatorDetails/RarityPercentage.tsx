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
  onSetFolders: (folders: { mainFolders: MainFolder[] }) => void;
}

const RarityPercentage = ({ folders, onSetFolders }: RarityPercentageProps) => {
  const [selectedMainFolder, setSelectedMainFolder] = useState(
    folders.mainFolders[0].name || ""
  );

  const handleRarityChange = (folder: string, value: number) => {
    const updatedMainFolders = folders.mainFolders.map((mainFolder) => {
      if (mainFolder.name === selectedMainFolder) {
        const updatedRarityFolders = mainFolder.rarityFolders.map(
          (rarityFolder) => {
            if (rarityFolder.name === folder) {
              return {
                ...rarityFolder,
                rarity: value,
              };
            }
            return rarityFolder;
          }
        );

        return {
          ...mainFolder,
          rarityFolders: updatedRarityFolders,
        };
      }
      return mainFolder;
    });

    onSetFolders({ ...folders, mainFolders: updatedMainFolders });
  };

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
            {folders.mainFolders.map((folder, index) => (
              <MenuItem key={index} value={folder.name}>
                <Typography>{folder.name}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        {folders.mainFolders
          .find((mainFolder) => mainFolder.name === selectedMainFolder)
          ?.rarityFolders.map((folder, index) => (
            <Grid
              key={index}
              container
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography>{folder.name}:</Typography>
              <Input
                type="number"
                value={folder.rarity}
                onChange={(e) =>
                  handleRarityChange(folder.name, parseFloat(e.target.value))
                }
                inputProps={{ min: 0, max: 100, step: 5 }}
              />
            </Grid>
          ))}
      </Grid>
    </Grid>
  );
};

export default RarityPercentage;
