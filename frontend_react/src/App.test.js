import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Recipe Explorer header", () => {
  render(<App />);
  const title = screen.getByText(/Recipe Explorer/i);
  expect(title).toBeInTheDocument();
});
