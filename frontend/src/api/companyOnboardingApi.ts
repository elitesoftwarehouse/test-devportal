import axios from "axios";

export interface CompanyDraftRequest {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string | null;
  emailAziendale: string;
  telefono: string;
}

export interface SedeLegaleRequest {
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  stato: string;
}

const apiClient = axios.create({
  baseURL: "/api",
});

export const getMyCompanyOnboardingStatus = async () => {
  const res = await apiClient.get("/me/onboarding/company");
  return res.data;
};

export const createCompanyDraft = async (payload: CompanyDraftRequest) => {
  const res = await apiClient.post("/onboarding/company/draft", payload);
  return res.data;
};

export const updateCompanyDraft = async (
  companyId: string,
  payload: { sedeLegale: SedeLegaleRequest }
) => {
  const res = await apiClient.put(`/onboarding/company/${companyId}`, payload);
  return res.data;
};

export const confirmCompanyOnboarding = async (companyId: string) => {
  const res = await apiClient.post(`/onboarding/company/${companyId}/confirm`);
  return res.data;
};
