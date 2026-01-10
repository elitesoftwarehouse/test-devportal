using System;
using System.ComponentModel.DataAnnotations;

namespace ElitePortal.WebAPI.Models.Requests
{
    /// <summary>
    /// Modello per creazione/aggiornamento Azienda fornitrice.
    /// </summary>
    public class UpsertSupplierCompanyRequest
    {
        public Guid? Id { get; set; }

        [Required]
        [MaxLength(32)]
        public string Codice { get; set; } = string.Empty;

        [Required]
        [MaxLength(256)]
        public string RagioneSociale { get; set; } = string.Empty;

        [MaxLength(256)]
        public string? NomeCommerciale { get; set; }

        [MaxLength(32)]
        public string? PartitaIva { get; set; }

        [MaxLength(32)]
        public string? CodiceFiscale { get; set; }

        [MaxLength(256)]
        public string? Indirizzo { get; set; }

        [MaxLength(16)]
        public string? CAP { get; set; }

        [MaxLength(128)]
        public string? Citta { get; set; }

        [MaxLength(64)]
        public string? Provincia { get; set; }

        [MaxLength(64)]
        public string? Nazione { get; set; }

        [MaxLength(64)]
        public string? Telefono { get; set; }

        [MaxLength(256)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(256)]
        public string? SitoWeb { get; set; }

        public bool Attivo { get; set; } = true;
    }
}
