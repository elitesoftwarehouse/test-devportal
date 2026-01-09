package com.elite.portal.modules.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.elite.portal.core.entity.ProfessionalContact;
import com.elite.portal.core.entity.ProfessionalProfile;
import com.elite.portal.core.entity.ProfessionalTaxData;
import com.elite.portal.core.entity.User;
import com.elite.portal.core.repository.ProfessionalContactRepository;
import com.elite.portal.core.repository.ProfessionalProfileRepository;
import com.elite.portal.core.repository.ProfessionalTaxDataRepository;
import com.elite.portal.core.repository.UserRepository;
import com.elite.portal.modules.user.dto.ProfessionalProfileDto;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class ProfessionalProfileServiceTest {

    @Mock
    private ProfessionalProfileRepository professionalProfileRepository;

    @Mock
    private ProfessionalContactRepository professionalContactRepository;

    @Mock
    private ProfessionalTaxDataRepository professionalTaxDataRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProfessionalProfileService professionalProfileService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void upsertForUser_createsProfileSuccessfully() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setUsername("test@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(professionalProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());

        when(professionalProfileRepository.save(any(ProfessionalProfile.class))).thenAnswer(invocation -> {
            ProfessionalProfile p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });

        when(professionalContactRepository.findAll()).thenReturn(Collections.emptyList());
        when(professionalTaxDataRepository.findAll()).thenReturn(Collections.emptyList());

        when(professionalContactRepository.save(any(ProfessionalContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(professionalTaxDataRepository.save(any(ProfessionalTaxData.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfessionalProfileDto dto = new ProfessionalProfileDto();
        dto.setFirstName("Mario");
        dto.setLastName("Rossi");
        dto.setFiscalCode("RSSMRA80A01H501U");
        dto.setPrimaryEmail("mario.rossi@example.com");
        dto.setMobilePhone("3331234567");
        dto.setTaxRegime("Forfettario");
        dto.setPecEmail("mario.rossi@pec.it");
        dto.setResidenceAddress("Via Roma 1");
        dto.setResidenceCity("Milano");
        dto.setResidenceZip("20100");
        dto.setResidenceProvince("MI");
        dto.setResidenceCountry("Italia");

        ProfessionalProfileDto result = professionalProfileService.upsertForUser(userId, dto);

        assertNotNull(result.getId());
        assertEquals("Mario", result.getFirstName());
        assertEquals("Rossi", result.getLastName());
        assertEquals("RSSMRA80A01H501U", result.getFiscalCode());
        assertEquals("mario.rossi@example.com", result.getPrimaryEmail());
        assertEquals("3331234567", result.getMobilePhone());
        assertEquals("Forfettario", result.getTaxRegime());
        assertEquals("mario.rossi@pec.it", result.getPecEmail());
    }
}
