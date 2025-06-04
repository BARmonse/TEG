package api.config;

import api.model.User;
import api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class TestEntitiesCreator {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void createTestEntities() {
        ensureInitialUsers();
    }

    private void ensureInitialUsers() {
        User barmonseTestUser = userRepository.findByEmail("barmonse@gmail.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("barmonse")
                        .email("barmonse@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .isActive(true)
                        .build()));

        User guisoTestUser = userRepository.findByEmail("guiso@gmail.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("guiso")
                        .email("guiso@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .isActive(true)
                        .build()));

        User elitekronTestUser = userRepository.findByEmail("elitekron@gmail.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("elitekron")
                        .email("elitekron@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .isActive(true)
                        .build()));
    }
} 