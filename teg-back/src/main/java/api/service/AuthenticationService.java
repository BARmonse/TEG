package api.service;

import api.dto.AuthenticationResponse;
import api.dto.LoginDTO;
import api.dto.UserRegistrationDTO;
import api.model.User;
import api.repository.UserRepository;
import api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(UserRegistrationDTO request) {
        log.info("Attempting to register user: {}", request.getUsername());
        
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username already exists - {}", request.getUsername());
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        var user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());
        user.setGamesPlayed(0);
        user.setGamesWon(0);

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getUsername());

        String token = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .gamesPlayed(user.getGamesPlayed())
                .gamesWon(user.getGamesWon())
                .gamesLost(user.getGamesLost())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .isActive(user.getIsActive())
                .build();
    }

    public AuthenticationResponse authenticate(LoginDTO request) {
        log.info("Attempting authentication for user: {}", request.getUsernameOrEmail());
        
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsernameOrEmail(),
                    request.getPassword()
                )
            );

            User user = userRepository.findByUsername(request.getUsernameOrEmail())
                    .orElseGet(() -> userRepository.findByEmail(request.getUsernameOrEmail())
                            .orElseThrow(() -> {
                                log.warn("Authentication failed: User not found - {}", request.getUsernameOrEmail());
                                return new RuntimeException("User not found");
                            }));

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtService.generateToken(user);
            log.info("User authenticated successfully: {}", user.getUsername());

            return AuthenticationResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .gamesPlayed(user.getGamesPlayed())
                    .gamesWon(user.getGamesWon())
                    .gamesLost(user.getGamesLost())
                    .lastLogin(user.getLastLogin())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .isActive(user.getIsActive())
                    .build();
        } catch (Exception e) {
            log.error("Authentication failed for user: {} - Error: {}", request.getUsernameOrEmail(), e.getMessage());
            throw e;
        }
    }

    public AuthenticationResponse getCurrentUser(String username) {
        log.info("Getting current user info for: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new RuntimeException("User not found");
                });

        return AuthenticationResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .gamesPlayed(user.getGamesPlayed())
                .gamesWon(user.getGamesWon())
                .gamesLost(user.getGamesLost())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .isActive(user.getIsActive())
                .build();
    }
} 