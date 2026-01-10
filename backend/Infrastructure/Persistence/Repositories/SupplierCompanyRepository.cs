using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ElitePortal.Application.Interfaces.Repositories;
using ElitePortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElitePortal.Infrastructure.Persistence.Repositories
{
    public class SupplierCompanyRepository : ISupplierCompanyRepository
    {
        private readonly AppDbContext _context;

        public SupplierCompanyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<SupplierCompany>> GetAllAsync(bool? onlyActive = null)
        {
            IQueryable<SupplierCompany> query = _context.SupplierCompanies.AsNoTracking();

            if (onlyActive.HasValue && onlyActive.Value)
            {
                query = query.Where(x => x.Attivo);
            }

            return await query
                .OrderBy(x => x.RagioneSociale)
                .ToListAsync();
        }

        public async Task<SupplierCompany?> GetByIdAsync(Guid id)
        {
            return await _context.SupplierCompanies
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<SupplierCompany> AddAsync(SupplierCompany entity)
        {
            _context.SupplierCompanies.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(SupplierCompany entity)
        {
            _context.SupplierCompanies.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsCodiceAsync(string codice, Guid? excludeId = null)
        {
            IQueryable<SupplierCompany> query = _context.SupplierCompanies
                .Where(x => x.Codice == codice);

            if (excludeId.HasValue)
            {
                query = query.Where(x => x.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
