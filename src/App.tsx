import { Route, Routes } from "react-router";
import React from "react";
import Header from "./components/Header";
import { Grid } from "@mui/material";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";

const App = () => {
  return (
    <Grid container>
      <Header />
      <Grid margin={5} item width={"100%"}>
        <Routes>
          <Route path="/*" Component={HomePage} />
          <Route index path="/" Component={HomePage} />
          <Route path="/create" Component={CreatePage} />
        </Routes>
      </Grid>
    </Grid>
  );
};

export default App;
