using System;
using ElitePortal.Domain.Entities;
using Xunit;

namespace ElitePortal.Tests.Domain
{
    public class SupplierCompanyTests
    {
        [Fact]
        public void CanCreateSupplierCompany_WithMinimumRequiredFields()
        {
            var now = DateTime.UtcNow;
            var entity = new SupplierCompany
            {
                Id = Guid.NewGuid(),
                Codice = "SUP-001",
                RagioneSociale = "Fornitore Test S.r.l.",
                Attivo = true,
                CreatedAt = now,
                CreatedBy = "test"
            };

            Assert.Equal("SUP-001", entity.Codice);
            Assert.Equal("Fornitore Test S.r.l.", entity.RagioneSociale);
            Assert.True(entity.Attivo);
            Assert.Equal("test", entity.CreatedBy);
        }
    }
}
