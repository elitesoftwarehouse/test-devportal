package com.elite.portal.modules.user.service;

import com.elite.portal.core.entity.ProfessionalContact;
import com.elite.portal.core.entity.ProfessionalProfile;
import com.elite.portal.core.entity.ProfessionalTaxData;
import com.elite.portal.core.entity.User;
import com.elite.portal.core.repository.ProfessionalContactRepository;
import com.elite.portal.core.repository.ProfessionalProfileRepository;
import com.elite.portal.core.repository.ProfessionalTaxDataRepository;
import com.elite.portal.core.repository.UserRepository;
import com.elite.portal.modules.user.dto.ProfessionalProfileDto;
import java.util.Optional;
import javax.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfessionalProfileService {

    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ProfessionalContactRepository professionalContactRepository;
    private final ProfessionalTaxDataRepository professionalTaxDataRepository;
    private final UserRepository userRepository;

    public ProfessionalProfileService(
            ProfessionalProfileRepository professionalProfileRepository,
            ProfessionalContactRepository professionalContactRepository,
            ProfessionalTaxDataRepository professionalTaxDataRepository,
            UserRepository userRepository) {
        this.professionalProfileRepository = professionalProfileRepository;
        this.professionalContactRepository = professionalContactRepository;
        this.professionalTaxDataRepository = professionalTaxDataRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfessionalProfileDto getByUserId(Long userId) {
        Optional<ProfessionalProfile> profileOpt = professionalProfileRepository.findByUserId(userId);
        if (!profileOpt.isPresent()) {
            throw new EntityNotFoundException("Professional profile not found for user " + userId);
        }
        ProfessionalProfile profile = profileOpt.get();
        Optional<ProfessionalContact> contactOpt = professionalContactRepository.findAll().stream()
                .filter(c -> c.getProfessionalProfile().getId().equals(profile.getId()))
                .findFirst();
        Optional<ProfessionalTaxData> taxOpt = professionalTaxDataRepository.findAll().stream()
                .filter(t -> t.getProfessionalProfile().getId().equals(profile.getId()))
                .findFirst();
        return toDto(profile, contactOpt.orElse(null), taxOpt.orElse(null));
    }

    @Transactional
    public ProfessionalProfileDto upsertForUser(Long userId, ProfessionalProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    ProfessionalProfile p = new ProfessionalProfile();
                    p.setUser(user);
                    return p;
                });

        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setDateOfBirth(dto.getDateOfBirth());
        profile.setPlaceOfBirth(dto.getPlaceOfBirth());
        profile.setFiscalCode(dto.getFiscalCode());
        profile.setNationality(dto.getNationality());
        profile.setGender(dto.getGender());

        profile.setPrimaryEmail(dto.getPrimaryEmail());
        profile.setSecondaryEmail(dto.getSecondaryEmail());
        profile.setMobilePhone(dto.getMobilePhone());
        profile.setLandlinePhone(dto.getLandlinePhone());

        profile.setVatNumber(dto.getVatNumber());
        profile.setTaxRegime(dto.getTaxRegime());
        profile.setPecEmail(dto.getPecEmail());
        profile.setSdiCode(dto.getSdiCode());

        ProfessionalProfile savedProfile = professionalProfileRepository.save(profile);

        ProfessionalContact contact = professionalContactRepository.findAll().stream()
                .filter(c -> c.getProfessionalProfile().getId().equals(savedProfile.getId()))
                .findFirst()
                .orElseGet(() -> {
                    ProfessionalContact c = new ProfessionalContact();
                    c.setProfessionalProfile(savedProfile);
                    return c;
                });

        contact.setPrimaryEmail(dto.getPrimaryEmail());
        contact.setSecondaryEmail(dto.getSecondaryEmail());
        contact.setMobilePhone(dto.getMobilePhone());
        contact.setLandlinePhone(dto.getLandlinePhone());
        contact.setResidenceAddress(dto.getResidenceAddress());
        contact.setResidenceCity(dto.getResidenceCity());
        contact.setResidenceZip(dto.getResidenceZip());
        contact.setResidenceProvince(dto.getResidenceProvince());
        contact.setResidenceCountry(dto.getResidenceCountry());
        contact.setDomicileAddress(dto.getDomicileAddress());
        contact.setDomicileCity(dto.getDomicileCity());
        contact.setDomicileZip(dto.getDomicileZip());
        contact.setDomicileProvince(dto.getDomicileProvince());
        contact.setDomicileCountry(dto.getDomicileCountry());

        ProfessionalContact savedContact = professionalContactRepository.save(contact);

        ProfessionalTaxData taxData = professionalTaxDataRepository.findAll().stream()
                .filter(t -> t.getProfessionalProfile().getId().equals(savedProfile.getId()))
                .findFirst()
                .orElseGet(() -> {
                    ProfessionalTaxData t = new ProfessionalTaxData();
                    t.setProfessionalProfile(savedProfile);
                    return t;
                });

        taxData.setFiscalCode(dto.getFiscalCode());
        taxData.setVatNumber(dto.getVatNumber());
        taxData.setTaxRegime(dto.getTaxRegime());
        taxData.setTaxAddress(dto.getTaxAddress());
        taxData.setTaxCity(dto.getTaxCity());
        taxData.setTaxZip(dto.getTaxZip());
        taxData.setTaxProvince(dto.getTaxProvince());
        taxData.setTaxCountry(dto.getTaxCountry());
        taxData.setPecEmail(dto.getPecEmail());
        taxData.setSdiCode(dto.getSdiCode());

        ProfessionalTaxData savedTax = professionalTaxDataRepository.save(taxData);

        return toDto(savedProfile, savedContact, savedTax);
    }

    private ProfessionalProfileDto toDto(ProfessionalProfile profile, ProfessionalContact contact, ProfessionalTaxData tax) {
        ProfessionalProfileDto dto = new ProfessionalProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());

        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setPlaceOfBirth(profile.getPlaceOfBirth());
        dto.setFiscalCode(profile.getFiscalCode());
        dto.setNationality(profile.getNationality());
        dto.setGender(profile.getGender());

        dto.setPrimaryEmail(profile.getPrimaryEmail());
        dto.setSecondaryEmail(profile.getSecondaryEmail());
        dto.setMobilePhone(profile.getMobilePhone());
        dto.setLandlinePhone(profile.getLandlinePhone());

        dto.setVatNumber(profile.getVatNumber());
        dto.setTaxRegime(profile.getTaxRegime());
        dto.setPecEmail(profile.getPecEmail());
        dto.setSdiCode(profile.getSdiCode());

        if (contact != null) {
            dto.setResidenceAddress(contact.getResidenceAddress());
            dto.setResidenceCity(contact.getResidenceCity());
            dto.setResidenceZip(contact.getResidenceZip());
            dto.setResidenceProvince(contact.getResidenceProvince());
            dto.setResidenceCountry(contact.getResidenceCountry());
            dto.setDomicileAddress(contact.getDomicileAddress());
            dto.setDomicileCity(contact.getDomicileCity());
            dto.setDomicileZip(contact.getDomicileZip());
            dto.setDomicileProvince(contact.getDomicileProvince());
            dto.setDomicileCountry(contact.getDomicileCountry());
        }

        if (tax != null) {
            dto.setTaxAddress(tax.getTaxAddress());
            dto.setTaxCity(tax.getTaxCity());
            dto.setTaxZip(tax.getTaxZip());
            dto.setTaxProvince(tax.getTaxProvince());
            dto.setTaxCountry(tax.getTaxCountry());
        }

        return dto;
    }
}
