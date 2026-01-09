package com.elite.portal.modules.security.user.config;

import com.elite.portal.modules.security.rbac.entity.Role;
import com.elite.portal.modules.security.rbac.model.RoleCode;
import com.elite.portal.modules.security.rbac.repository.RoleRepository;
import com.elite.portal.modules.security.user.entity.User;
import com.elite.portal.modules.security.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class UserSeedConfig {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${elite.portal.seed.sysadmin.username:sysadmin}")
    private String sysAdminUsername;

    @Value("${elite.portal.seed.sysadmin.password:ChangeMe!SysAdmin1}")
    private String sysAdminPassword;

    @Value("${elite.portal.seed.itoperator.username:itoperator}")
    private String itOperatorUsername;

    @Value("${elite.portal.seed.itoperator.password:ChangeMe!ItOp1}")
    private String itOperatorPassword;

    @Value("${elite.portal.seed.create-itoperator:true}")
    private boolean createItOperator;

    public UserSeedConfig(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedDefaultUsers() {
        seedSysAdminUser();
        if (createItOperator) {
            seedItOperatorUser();
        }
    }

    private void seedSysAdminUser() {
        Optional<User> existing = userRepository.findByUsername(sysAdminUsername);
        if (existing.isPresent()) {
            return;
        }
        Role sysAdminRole = roleRepository.findByCode(RoleCode.SYS_ADMIN.getCode())
                .orElseThrow(() -> new IllegalStateException("Ruolo SYS_ADMIN non trovato. Assicurarsi che RbacStartupConfig sia eseguita prima del seed utenti."));
        User user = new User();
        user.setUsername(sysAdminUsername);
        user.setPassword(passwordEncoder.encode(sysAdminPassword));
        user.setEnabled(true);
        user.addRole(sysAdminRole);
        userRepository.save(user);
    }

    private void seedItOperatorUser() {
        Optional<User> existing = userRepository.findByUsername(itOperatorUsername);
        if (existing.isPresent()) {
            return;
        }
        Role itOperatorRole = roleRepository.findByCode(RoleCode.IT_OPERATOR.getCode())
                .orElseThrow(() -> new IllegalStateException("Ruolo IT_OPERATOR non trovato. Assicurarsi che RbacStartupConfig sia eseguita prima del seed utenti."));
        User user = new User();
        user.setUsername(itOperatorUsername);
        user.setPassword(passwordEncoder.encode(itOperatorPassword));
        user.setEnabled(true);
        user.addRole(itOperatorRole);
        userRepository.save(user);
    }
}
