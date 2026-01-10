using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ElitePortal.Application.Interfaces.Repositories;
using ElitePortal.Domain.Entities;
using ElitePortal.WebAPI.Controllers;
using ElitePortal.WebAPI.Models.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace ElitePortal.Tests.WebAPI
{
    public class SupplierCompaniesControllerTests
    {
        [Fact]
        public async Task Create_ValidRequest_ReturnsCreated()
        {
            var repoMock = new Mock<ISupplierCompanyRepository>();
            repoMock.Setup(r => r.ExistsCodiceAsync(It.IsAny<string>(), null))
                .ReturnsAsync(false);
            repoMock.Setup(r => r.AddAsync(It.IsAny<SupplierCompany>()))
                .ReturnsAsync((SupplierCompany s) => s);

            var controller = new SupplierCompaniesController(repoMock.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "test-user") }))
                }
            };

            var request = new UpsertSupplierCompanyRequest
            {
                Codice = "SUP-001",
                RagioneSociale = "Fornitore Test S.r.l.",
                Attivo = true
            };

            var result = await controller.Create(request);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.NotNull(created.Value);
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var repoMock = new Mock<ISupplierCompanyRepository>();
            repoMock.Setup(r => r.GetAllAsync(It.IsAny<bool?>()))
                .ReturnsAsync(new List<SupplierCompany>());

            var controller = new SupplierCompaniesController(repoMock.Object);

            var result = await controller.GetAll(null);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);
        }
    }
}
