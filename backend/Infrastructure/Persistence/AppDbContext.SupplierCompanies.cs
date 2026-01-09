using ElitePortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElitePortal.Infrastructure.Persistence
{
    public partial class AppDbContext : DbContext
    {
        public virtual DbSet<SupplierCompany> SupplierCompanies { get; set; } = null!;
    }
}
