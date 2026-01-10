using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ElitePortal.Domain.Entities;

namespace ElitePortal.Application.Interfaces.Repositories
{
    public interface ISupplierCompanyRepository
    {
        Task<IReadOnlyList<SupplierCompany>> GetAllAsync(bool? onlyActive = null);
        Task<SupplierCompany?> GetByIdAsync(Guid id);
        Task<SupplierCompany> AddAsync(SupplierCompany entity);
        Task UpdateAsync(SupplierCompany entity);
        Task<bool> ExistsCodiceAsync(string codice, Guid? excludeId = null);
    }
}
