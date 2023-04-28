import React from "react";
import Header from "./pages/Header";
import { Grid } from "@mui/material";
import UploadToIpfs from "./components/UploadToIpfs";

const App = () => {
  return (
    <Grid container>
      <Header />
      <Grid margin={5}>
        <UploadToIpfs />
      </Grid>
    </Grid>
  );
};

export default App;
