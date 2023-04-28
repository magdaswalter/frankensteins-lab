import React from "react";
import Header from "./pages/Header";
import { Grid } from "@mui/material";
import UploadToIpfs from "./components/UploadToIpfs";

const App = () => {
  return (
    <Grid container>
      <Header />
      <UploadToIpfs />
    </Grid>
  );
};

export default App;
