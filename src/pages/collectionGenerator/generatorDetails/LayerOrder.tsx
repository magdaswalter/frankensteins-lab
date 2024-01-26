import React, { useRef, useState } from "react";
import { Grid, Typography, Checkbox, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDrag, useDrop } from "react-dnd";

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface FolderItemProps {
  id: string;
  folder: string;
  index: number;
  moveFolder: (dragIndex: number, hoverIndex: number) => void;
  selectedMainFolders: Set<string>;
  toggleFolderSelection: (folder: string) => void;
  tempMainFolderPercentages: React.MutableRefObject<MainFolderPercentages>;
}

interface LayerOrderProps {
  mainFolders: string[];
  moveFolder: (dragIndex: number, hoverIndex: number) => void;
  selectedMainFolders: Set<string>;
  toggleFolderSelection: (folder: string) => void;
  tempMainFolderPercentages: React.MutableRefObject<MainFolderPercentages>;
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
  cursor: "pointer",
  fontSize: "20px",
});

const FolderItem = ({
  id,
  folder,
  index,
  moveFolder,
  selectedMainFolders,
  toggleFolderSelection,
  tempMainFolderPercentages,
}: FolderItemProps) => {
  const [localPercentage, setLocalPercentage] = useState(
    tempMainFolderPercentages.current[folder]
  );
  const isSelected = selectedMainFolders.has(folder);

  const [, drag] = useDrag(
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
    setLocalPercentage(newValue);
    tempMainFolderPercentages.current[folder] = newValue;
  };

  const ref = useRef<HTMLDivElement>(null);

  drag(drop(ref));

  return (
    <Grid ref={ref} item style={getItemStyle()}>
      <Checkbox
        checked={isSelected}
        onChange={() => toggleFolderSelection(folder)}
      />
      <span>{folder}</span>
      <input
        type="number"
        value={localPercentage}
        onChange={handleLocalPercentageChange}
        disabled={!isSelected}
        min="0"
        max="100"
        style={{ width: "40px", marginRight: "10px" }}
      />
      <span>%</span>
      <IconButton size="small">
        <DragIndicatorIcon />
      </IconButton>
    </Grid>
  );
};

const LayerOrder = ({
  mainFolders,
  moveFolder,
  selectedMainFolders,
  toggleFolderSelection,
  tempMainFolderPercentages,
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
            folder={folder}
            index={index}
            moveFolder={moveFolder}
            selectedMainFolders={selectedMainFolders}
            toggleFolderSelection={toggleFolderSelection}
            tempMainFolderPercentages={tempMainFolderPercentages}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default LayerOrder;
