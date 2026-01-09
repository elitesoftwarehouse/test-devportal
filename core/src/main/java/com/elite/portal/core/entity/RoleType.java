package com.elite.portal.core.entity;

/**
 * Enum dei ruoli logici del sistema.
 *
 * NOTA: questo file assume che non esista ancora un enum equivalente.
 * Se esiste già un enum RoleType/RoleName, estendere quello invece di creare questo.
 */
public enum RoleType {

    // Ruoli esterni (scope di questa story)
    EXTERNAL_OWNER,
    EXTERNAL_COLLABORATOR,

    // Ruoli interni (già previsti dallo schema RBAC globale)
    IT_OPERATOR,
    SYS_ADMIN

}
