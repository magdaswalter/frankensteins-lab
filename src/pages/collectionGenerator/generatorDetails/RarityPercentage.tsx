import React from "react";
import { Grid, Typography } from "@mui/material";

const RarityPercentage = () => {
  return (
    <Grid container direction="column" rowGap={2} alignItems="center">
      <Grid item>
        <Typography fontSize={22}>Rarity percentage</Typography>
      </Grid>
      <Grid item>{/* Content for Rarity Percentage */}</Grid>
    </Grid>
  );
};

export default RarityPercentage;
