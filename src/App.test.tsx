import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Frankenstein's lab", () => {
  render(<App />);
  const element = screen.getByText(/Frankenstein's Lab/);
  expect(element).toBeInTheDocument();
});
