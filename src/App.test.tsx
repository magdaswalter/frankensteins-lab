import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders NFT luncher", () => {
  render(<App />);
  const element = screen.getByText(/NFT Luncher/);
  expect(element).toBeInTheDocument();
});
