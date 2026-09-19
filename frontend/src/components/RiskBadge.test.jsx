import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RiskBadge from "./RiskBadge";

describe("RiskBadge", () => {
  it("renders CRITICAL risk level with proper label and score", () => {
    render(<RiskBadge level="CRITICAL" score={88} />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("(88%)")).toBeInTheDocument();
  });

  it("renders LOW risk level correctly", () => {
    render(<RiskBadge level="LOW" score={15} />);
    expect(screen.getByText("LOW")).toBeInTheDocument();
    expect(screen.getByText("(15%)")).toBeInTheDocument();
  });
});