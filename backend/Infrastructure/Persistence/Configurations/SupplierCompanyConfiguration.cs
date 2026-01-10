using ElitePortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElitePortal.Infrastructure.Persistence.Configurations
{
    /// <summary>
    /// Configurazione EF Core per SupplierCompany: vincoli, indici e relazioni.
    /// </summary>
    public class SupplierCompanyConfiguration : IEntityTypeConfiguration<SupplierCompany>
    {
        public void Configure(EntityTypeBuilder<SupplierCompany> builder)
        {
            builder.ToTable("SupplierCompanies");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .IsRequired();

            builder.Property(x => x.Codice)
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(x => x.RagioneSociale)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(x => x.NomeCommerciale)
                .HasMaxLength(256);

            builder.Property(x => x.PartitaIva)
                .HasMaxLength(32);

            builder.Property(x => x.CodiceFiscale)
                .HasMaxLength(32);

            builder.Property(x => x.Indirizzo)
                .HasMaxLength(256);

            builder.Property(x => x.CAP)
                .HasMaxLength(16);

            builder.Property(x => x.Citta)
                .HasMaxLength(128);

            builder.Property(x => x.Provincia)
                .HasMaxLength(64);

            builder.Property(x => x.Nazione)
                .HasMaxLength(64);

            builder.Property(x => x.Telefono)
                .HasMaxLength(64);

            builder.Property(x => x.Email)
                .HasMaxLength(256);

            builder.Property(x => x.SitoWeb)
                .HasMaxLength(256);

            builder.Property(x => x.Attivo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.CreatedBy)
                .HasMaxLength(128);

            builder.Property(x => x.UpdatedAt);

            builder.Property(x => x.UpdatedBy)
                .HasMaxLength(128);

            // Indici per ricerche frequenti
            builder.HasIndex(x => x.PartitaIva)
                .HasDatabaseName("IX_SupplierCompanies_PartitaIva");

            builder.HasIndex(x => x.RagioneSociale)
                .HasDatabaseName("IX_SupplierCompanies_RagioneSociale");

            builder.HasIndex(x => x.Attivo)
                .HasDatabaseName("IX_SupplierCompanies_Attivo");

            builder.HasIndex(x => x.Codice)
                .IsUnique()
                .HasDatabaseName("UX_SupplierCompanies_Codice");

            // Relazione opzionale con Companies (se esiste in modello). Configurata in modo difensivo.
            builder.HasOne<object>()
                .WithMany()
                .HasForeignKey("CompanyId")
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_SupplierCompanies_Companies_CompanyId");
        }
    }
}
