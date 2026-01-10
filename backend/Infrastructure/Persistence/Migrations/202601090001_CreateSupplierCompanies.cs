using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ElitePortal.Infrastructure.Persistence.Migrations
{
    public partial class CreateSupplierCompanies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SupplierCompanies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Codice = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    RagioneSociale = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NomeCommerciale = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PartitaIva = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    CodiceFiscale = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Indirizzo = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CAP = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                    Citta = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Provincia = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Nazione = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SitoWeb = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Attivo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierCompanies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierCompanies_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCompanies_Attivo",
                table: "SupplierCompanies",
                column: "Attivo");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCompanies_PartitaIva",
                table: "SupplierCompanies",
                column: "PartitaIva");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCompanies_RagioneSociale",
                table: "SupplierCompanies",
                column: "RagioneSociale");

            migrationBuilder.CreateIndex(
                name: "UX_SupplierCompanies_Codice",
                table: "SupplierCompanies",
                column: "Codice",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierCompanies_CompanyId",
                table: "SupplierCompanies",
                column: "CompanyId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplierCompanies");
        }
    }
}
