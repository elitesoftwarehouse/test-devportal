using System;

namespace ElitePortal.Domain.Entities
{
    /// <summary>
    /// Rappresenta un'Azienda fornitrice (anagrafica base: dati identificativi, fiscali minimi, recapiti e stato).
    /// </summary>
    public class SupplierCompany
    {
        public Guid Id { get; set; }

        // Riferimento opzionale all'anagrafica aziendale generale, se presente nel modello dati
        public Guid? CompanyId { get; set; }

        // Dati identificativi
        public string Codice { get; set; } = null!; // codice interno fornitore
        public string RagioneSociale { get; set; } = null!;
        public string? NomeCommerciale { get; set; }

        // Dati fiscali minimi
        public string? PartitaIva { get; set; }
        public string? CodiceFiscale { get; set; }

        // Recapiti
        public string? Indirizzo { get; set; }
        public string? CAP { get; set; }
        public string? Citta { get; set; }
        public string? Provincia { get; set; }
        public string? Nazione { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public string? SitoWeb { get; set; }

        // Stato
        public bool Attivo { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
