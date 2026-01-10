using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ElitePortal.Application.DTOs;
using ElitePortal.Application.Interfaces.Repositories;
using ElitePortal.Domain.Entities;
using ElitePortal.WebAPI.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElitePortal.WebAPI.Controllers
{
    [ApiController]
    [Route("api/supplier-companies")]
    [Authorize]
    public class SupplierCompaniesController : ControllerBase
    {
        private readonly ISupplierCompanyRepository _repository;

        public SupplierCompaniesController(ISupplierCompanyRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierCompanyDto>>> GetAll([FromQuery] bool? onlyActive)
        {
            var entities = await _repository.GetAllAsync(onlyActive);
            var dtos = entities.Select(MapToDto).ToList();
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierCompanyDto>> GetById(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            return Ok(MapToDto(entity));
        }

        [HttpPost]
        public async Task<ActionResult<SupplierCompanyDto>> Create([FromBody] UpsertSupplierCompanyRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var exists = await _repository.ExistsCodiceAsync(request.Codice);
            if (exists)
            {
                ModelState.AddModelError("Codice", "Codice fornitore già esistente.");
                return ValidationProblem(ModelState);
            }

            var now = DateTime.UtcNow;
            var user = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";

            var entity = new SupplierCompany
            {
                Id = Guid.NewGuid(),
                Codice = request.Codice.Trim(),
                RagioneSociale = request.RagioneSociale.Trim(),
                NomeCommerciale = request.NomeCommerciale?.Trim(),
                PartitaIva = request.PartitaIva?.Trim(),
                CodiceFiscale = request.CodiceFiscale?.Trim(),
                Indirizzo = request.Indirizzo,
                CAP = request.CAP,
                Citta = request.Citta,
                Provincia = request.Provincia,
                Nazione = request.Nazione,
                Telefono = request.Telefono,
                Email = request.Email,
                SitoWeb = request.SitoWeb,
                Attivo = request.Attivo,
                CreatedAt = now,
                CreatedBy = user
            };

            await _repository.AddAsync(entity);

            var dto = MapToDto(entity);

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SupplierCompanyDto>> Update(Guid id, [FromBody] UpsertSupplierCompanyRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var existsCodice = await _repository.ExistsCodiceAsync(request.Codice, id);
            if (existsCodice)
            {
                ModelState.AddModelError("Codice", "Codice fornitore già esistente per un altro record.");
                return ValidationProblem(ModelState);
            }

            var now = DateTime.UtcNow;
            var user = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";

            entity.Codice = request.Codice.Trim();
            entity.RagioneSociale = request.RagioneSociale.Trim();
            entity.NomeCommerciale = request.NomeCommerciale?.Trim();
            entity.PartitaIva = request.PartitaIva?.Trim();
            entity.CodiceFiscale = request.CodiceFiscale?.Trim();
            entity.Indirizzo = request.Indirizzo;
            entity.CAP = request.CAP;
            entity.Citta = request.Citta;
            entity.Provincia = request.Provincia;
            entity.Nazione = request.Nazione;
            entity.Telefono = request.Telefono;
            entity.Email = request.Email;
            entity.SitoWeb = request.SitoWeb;
            entity.Attivo = request.Attivo;
            entity.UpdatedAt = now;
            entity.UpdatedBy = user;

            await _repository.UpdateAsync(entity);

            var dto = MapToDto(entity);
            return Ok(dto);
        }

        private static SupplierCompanyDto MapToDto(SupplierCompany entity)
        {
            return new SupplierCompanyDto
            {
                Id = entity.Id,
                Codice = entity.Codice,
                RagioneSociale = entity.RagioneSociale,
                NomeCommerciale = entity.NomeCommerciale,
                PartitaIva = entity.PartitaIva,
                CodiceFiscale = entity.CodiceFiscale,
                Indirizzo = entity.Indirizzo,
                CAP = entity.CAP,
                Citta = entity.Citta,
                Provincia = entity.Provincia,
                Nazione = entity.Nazione,
                Telefono = entity.Telefono,
                Email = entity.Email,
                SitoWeb = entity.SitoWeb,
                Attivo = entity.Attivo
            };
        }
    }
}
