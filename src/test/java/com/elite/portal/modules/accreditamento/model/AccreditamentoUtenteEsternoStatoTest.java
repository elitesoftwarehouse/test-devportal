package com.elite.portal.modules.accreditamento.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class AccreditamentoUtenteEsternoStatoTest {

    @Test
    void fromStringShouldReturnEnumValueIgnoringCase() {
        AccreditamentoUtenteEsternoStato stato = AccreditamentoUtenteEsternoStato.fromString("approvata");
        assertNotNull(stato);
        assertEquals(AccreditamentoUtenteEsternoStato.APPROVATA, stato);
    }

    @Test
    void fromStringShouldReturnNullForNullInput() {
        assertNull(AccreditamentoUtenteEsternoStato.fromString(null));
    }

    @Test
    void fromStringShouldThrowForInvalidValue() {
        assertThrows(IllegalArgumentException.class, () -> AccreditamentoUtenteEsternoStato.fromString("NON_VALIDO"));
    }
}
