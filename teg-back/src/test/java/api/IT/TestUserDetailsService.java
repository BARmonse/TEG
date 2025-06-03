package api.IT;

import api.model.User;
import api.repository.UserRepository;
import api.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;

class TestUserDetailsService extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User();
        user.setUsername("john");
        user.setEmail("john@example.com");
        user.setPassword("pass");
        userRepository.save(user);
    }

    @Test
    @DisplayName("Find user by username")
    void shouldFindUserByUsername() {
        UserDetails user = userDetailsService.loadUserByUsername("john");
        assertEquals("john", user.getUsername());
    }

    @Test
    @DisplayName("Find user by email")
    void shouldFindUserByEmailIfUsernameNotFound() {
        UserDetails user = userDetailsService.loadUserByUsername("john@example.com");
        assertEquals("john", user.getUsername());
    }

    @Test
    @DisplayName("Find user by username/email throws exception is not found")
    void shouldThrowWhenUserNotFound() {
        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("doesnotexist"));
    }
}

