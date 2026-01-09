import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SupplierCompanyForm } from "../SupplierCompanyForm";

jest.mock("../../../api/supplierCompaniesApi", () => ({
  createSupplierCompany: jest.fn().mockResolvedValue({
    id: "1",
    codice: "SUP-001",
    ragioneSociale: "Fornitore Test S.r.l.",
    attivo: true,
  }),
  updateSupplierCompany: jest.fn(),
}));

describe("SupplierCompanyForm", () => {
  it("renders basic fields", () => {
    render(<SupplierCompanyForm />);
    expect(screen.getByLabelText(/Codice/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ragione sociale/)).toBeInTheDocument();
  });

  it("calls onSaved after submit", async () => {
    const onSaved = jest.fn();
    render(<SupplierCompanyForm onSaved={onSaved} />);

    fireEvent.change(screen.getByLabelText(/Codice/), { target: { value: "SUP-001" } });
    fireEvent.change(screen.getByLabelText(/Ragione sociale/), { target: { value: "Fornitore Test S.r.l." } });

    fireEvent.submit(screen.getByRole("button", { name: /Salva/ }).closest("form") as HTMLFormElement);

    // semplice attesa: in un progetto reale usare waitFor
    await new Promise((r) => setTimeout(r, 0));

    expect(onSaved).toHaveBeenCalled();
  });
});
