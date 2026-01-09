using System;

namespace ElitePortal.Application.DTOs
{
    /// <summary>
    /// DTO per rappresentare i dati dell'Azienda fornitrice verso il frontend.
    /// </summary>
    public class SupplierCompanyDto
    {
        public Guid Id { get; set; }
        public string Codice { get; set; } = string.Empty;
        public string RagioneSociale { get; set; } = string.Empty;
        public string? NomeCommerciale { get; set; }
        public string? PartitaIva { get; set; }
        public string? CodiceFiscale { get; set; }
        public string? Indirizzo { get; set; }
        public string? CAP { get; set; }
        public string? Citta { get; set; }
        public string? Provincia { get; set; }
        public string? Nazione { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public string? SitoWeb { get; set; }
        public bool Attivo { get; set; }
    }
}
