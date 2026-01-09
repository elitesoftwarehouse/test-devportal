import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CompanyOnboardingWizard from "./CompanyOnboardingWizard";

jest.mock("../../api/companyOnboardingApi", () => ({
  getMyCompanyOnboardingStatus: jest.fn().mockResolvedValue({
    hasCompany: false,
    onboardingCompleted: false,
    companyId: null,
  }),
}));

describe("CompanyOnboardingWizard", () => {
  it("mostra il titolo del wizard", async () => {
    render(
      <MemoryRouter>
        <CompanyOnboardingWizard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Primo accreditamento azienda/i)).toBeInTheDocument();
  });
});
