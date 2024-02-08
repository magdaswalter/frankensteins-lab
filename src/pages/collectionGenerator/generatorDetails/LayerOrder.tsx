import React, { useRef, useState } from "react";
import { Grid, Typography, Checkbox, IconButton, Input } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDrag, useDrop } from "react-dnd";
import { MainFolder } from "../upload/FolderUploader";

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface FolderItemProps {
  id: string;
  folder: string;
  folders: { mainFolders: MainFolder[] };
  onSetFolders: (folders: { mainFolders: MainFolder[] }) => void;
  index: number;
  moveFolder: (dragIndex: number, hoverIndex: number) => void;
  toggleFolderSelection: (folder: string) => void;
}

interface LayerOrderProps {
  folders: { mainFolders: MainFolder[] };
  mainFolders: string[];
  onSetFolders: (folders: { mainFolders: MainFolder[] }) => void;
  moveFolder: (dragIndex: number, hoverIndex: number) => void;
  toggleFolderSelection: (folder: string) => void;
}

interface MainFolderPercentages {
  [key: string]: number;
}

const getItemStyle = (): React.CSSProperties => ({
  userSelect: "none",
  padding: 8,
  margin: `0 0 8px 0`,
  background: "lightgrey",
  color: "black",
  fontSize: "20px",
});

const FolderItem = ({
  id,
  folders,
  onSetFolders,
  folder,
  index,
  moveFolder,
  toggleFolderSelection,
}: FolderItemProps) => {
  const isSelected =
    folders.mainFolders.find((mainFolder) => mainFolder.name === folder)
      ?.selected ?? false;

  const [, drag, preview] = useDrag(
    () => ({
      type: "folder",
      item: { id, index },
    }),
    [id, index]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "folder",
      hover(item: DragItem, monitor) {
        if (!ref.current) {
          return;
        }
        if (item.index !== index) {
          moveFolder(item.index, index);
          item.index = index;
        }
      },
    }),
    [index, moveFolder]
  );

  const handleLocalPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseInt(e.target.value, 10);
    const updatedFolders = folders.mainFolders.map((mainFolder) => {
      if (mainFolder.name === folder) {
        return { ...mainFolder, percentage: newValue };
      }
      return mainFolder;
    });
    onSetFolders({ mainFolders: updatedFolders });
  };

  const ref = useRef<HTMLDivElement>(null);

  preview(drop(ref));

  return (
    <div ref={ref}>
      <Grid container style={getItemStyle()} alignItems="center" columnGap={2}>
        <Grid item>
          <Checkbox
            checked={isSelected}
            onChange={() => toggleFolderSelection(folder)}
          />
        </Grid>
        <Grid item>
          <span>{folder}</span>
        </Grid>
        <Grid item>
          <Input
            type="number"
            value={
              folders.mainFolders.find(
                (mainFolder) => mainFolder.name === folder
              )?.percentage ?? 100
            }
            onChange={handleLocalPercentageChange}
            disabled={!isSelected}
            inputProps={{ min: "0", max: "100", step: "10" }}
            style={{ width: "40px", marginRight: "10px" }}
          />
        </Grid>
        <Grid item>
          <IconButton size="small" ref={drag}>
            <DragIndicatorIcon />
          </IconButton>
        </Grid>
      </Grid>
    </div>
  );
};

const LayerOrder = ({
  folders,
  onSetFolders,
  mainFolders,
  moveFolder,
  toggleFolderSelection,
}: LayerOrderProps) => {
  return (
    <Grid container direction="column" rowGap={2} alignItems="center">
      <Grid item>
        <Typography fontSize={22}>Layer order</Typography>
      </Grid>
      <Grid item style={getItemStyle()}>
        {mainFolders.map((folder, index) => (
          <FolderItem
            key={folder}
            id={folder}
            folders={folders}
            onSetFolders={onSetFolders}
            folder={folder}
            index={index}
            moveFolder={moveFolder}
            toggleFolderSelection={toggleFolderSelection}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default LayerOrder;
