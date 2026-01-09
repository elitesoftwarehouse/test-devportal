import { db } from "../db";

export interface CompanyDraftPayload {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string | null;
  emailAziendale: string;
  telefono: string;
}

export interface SedeLegalePayload {
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  stato: string;
}

export class CompanyOnboardingService {
  async getOnboardingStatusForUser(userId: string) {
    // Verifica se l'utente ha un'azienda collegata e lo stato di accreditamento.
    // Si assume esistenza tabelle: companies, company_owners.
    const ownerRow = await db("company_owners")
      .where({ user_id: userId })
      .first();

    if (!ownerRow) {
      return {
        hasCompany: false,
        onboardingCompleted: false,
        companyId: null,
      };
    }

    const company = await db("companies").where({ id: ownerRow.company_id }).first();

    if (!company) {
      return {
        hasCompany: false,
        onboardingCompleted: false,
        companyId: null,
      };
    }

    return {
      hasCompany: true,
      onboardingCompleted: company.is_accredited === true,
      companyId: company.id,
      companyName: company.ragione_sociale,
    };
  }

  async createDraftCompanyWithOwner(userId: string, payload: CompanyDraftPayload) {
    // Controllo univocità Partita IVA
    const existing = await db("companies")
      .where({ partita_iva: payload.partitaIva })
      .first();
    if (existing) {
      const error: any = new Error("Partita IVA già esistente");
      error.code = "COMPANY_VAT_CONFLICT";
      throw error;
    }

    return await db.transaction(async (trx) => {
      const [company] = await trx("companies")
        .insert({
          ragione_sociale: payload.ragioneSociale,
          partita_iva: payload.partitaIva,
          codice_fiscale: payload.codiceFiscale,
          email_aziendale: payload.emailAziendale,
          telefono: payload.telefono,
          is_accredited: false,
          created_by: userId,
        })
        .returning(["id", "ragione_sociale", "partita_iva", "email_aziendale", "telefono", "is_accredited"]);

      const ownerExists = await trx("company_owners")
        .where({ user_id: userId, company_id: company.id })
        .first();

      if (!ownerExists) {
        await trx("company_owners").insert({
          user_id: userId,
          company_id: company.id,
          role: "LEGAL_REPRESENTATIVE",
        });
      }

      return {
        companyId: company.id,
        ragioneSociale: company.ragione_sociale,
        partitaIva: company.partita_iva,
        emailAziendale: company.email_aziendale,
        telefono: company.telefono,
        isAccredited: company.is_accredited,
      };
    });
  }

  async updateCompanyDraft(
    userId: string,
    companyId: string,
    payload: { sedeLegale: SedeLegalePayload }
  ) {
    const company = await db("companies").where({ id: companyId }).first();
    if (!company) {
      const error: any = new Error("Azienda non trovata");
      error.code = "COMPANY_NOT_FOUND";
      throw error;
    }

    // Verifica che l'utente sia owner della company
    const owner = await db("company_owners")
      .where({ user_id: userId, company_id: companyId })
      .first();

    if (!owner) {
      const error: any = new Error("Azienda non accessibile");
      error.code = "COMPANY_NOT_FOUND";
      throw error;
    }

    await db("companies")
      .where({ id: companyId })
      .update({
        sede_legale_indirizzo: payload.sedeLegale.indirizzo,
        sede_legale_cap: payload.sedeLegale.cap,
        sede_legale_citta: payload.sedeLegale.citta,
        sede_legale_provincia: payload.sedeLegale.provincia,
        sede_legale_stato: payload.sedeLegale.stato,
      });

    const updated = await db("companies")
      .where({ id: companyId })
      .first([
        "id",
        "ragione_sociale",
        "partita_iva",
        "email_aziendale",
        "telefono",
        "sede_legale_indirizzo",
        "sede_legale_cap",
        "sede_legale_citta",
        "sede_legale_provincia",
        "sede_legale_stato",
        "is_accredited",
      ]);

    return {
      companyId: updated.id,
      ragioneSociale: updated.ragione_sociale,
      partitaIva: updated.partita_iva,
      emailAziendale: updated.email_aziendale,
      telefono: updated.telefono,
      sedeLegale: {
        indirizzo: updated.sede_legale_indirizzo,
        cap: updated.sede_legale_cap,
        citta: updated.sede_legale_citta,
        provincia: updated.sede_legale_provincia,
        stato: updated.sede_legale_stato,
      },
      isAccredited: updated.is_accredited,
    };
  }

  async confirmCompanyOnboarding(userId: string, companyId: string) {
    const company = await db("companies").where({ id: companyId }).first();
    if (!company) {
      const error: any = new Error("Azienda non trovata");
      error.code = "COMPANY_NOT_FOUND";
      throw error;
    }

    const owner = await db("company_owners")
      .where({ user_id: userId, company_id: companyId })
      .first();

    if (!owner) {
      const error: any = new Error("Azienda non accessibile");
      error.code = "COMPANY_NOT_FOUND";
      throw error;
    }

    if (company.is_accredited) {
      const error: any = new Error("Onboarding già completato");
      error.code = "ONBOARDING_ALREADY_COMPLETED";
      throw error;
    }

    await db("companies").where({ id: companyId }).update({
      is_accredited: true,
      accredited_at: db.fn.now(),
      accredited_by: userId,
    });

    const updated = await db("companies")
      .where({ id: companyId })
      .first(["id", "ragione_sociale", "is_accredited"]);

    return {
      companyId: updated.id,
      ragioneSociale: updated.ragione_sociale,
      isAccredited: updated.is_accredited,
    };
  }
}
