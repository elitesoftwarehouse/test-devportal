import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { ProfileCompletenessIndicator } from "./ProfileCompletenessIndicator";

// Nota: in un contesto reale, andrebbe mockata la fetch API.

describe("ProfileCompletenessIndicator", () => {
  it("non rende nulla se manca profileId", () => {
    const { container } = render(<ProfileCompletenessIndicator profileType="professionista" profileId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("mostra titolo componente", () => {
    // Mock fetch minimale
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            completeness: {
              status: "green",
              percentage: 100,
              categories: []
            }
          })
      })
    );

    render(<ProfileCompletenessIndicator profileType="professionista" profileId={1} />);

    expect(screen.getByText("Completezza profilo")).toBeInTheDocument();
  });
});
