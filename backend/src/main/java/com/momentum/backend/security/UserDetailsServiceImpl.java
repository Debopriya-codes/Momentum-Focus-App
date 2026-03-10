package com.momentum.backend.security;

import com.momentum.backend.entity.User;
import com.momentum.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        // Google OAuth users have no local password – use an empty string so Spring Security doesn't NPE.
        // They can never authenticate via the DAO provider anyway (no password match).
        String pw = user.getPassword() != null ? user.getPassword() : "";
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                pw,
                Collections.emptyList()
        );
    }
}
