using ElitePortal.Application.Interfaces.Repositories;
using ElitePortal.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace ElitePortal.WebAPI
{
    public static class StartupSupplierCompanies
    {
        public static IServiceCollection AddSupplierCompaniesModule(this IServiceCollection services)
        {
            services.AddScoped<ISupplierCompanyRepository, SupplierCompanyRepository>();
            return services;
        }
    }
}
