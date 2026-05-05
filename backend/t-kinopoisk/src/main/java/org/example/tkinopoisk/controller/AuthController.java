package org.example.tkinopoisk.controller;

import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.repository.UserRepository;
import org.example.tkinopoisk.security.UserDetailsImpl;
import org.example.tkinopoisk.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegisterRequest(String login, String password) {
    }

    public record LoginRequest(String login, String password) {
    }

    public record AuthResponse(String token) {
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        String login = request.login() == null ? "" : request.login().trim();
        String password = request.password() == null ? "" : request.password();
        if (login.isEmpty() || password.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Login and password are required");
        }
        if (userRepository.findByLogin(login).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Login already taken");
        }
        User user = new User();
        user.setLogin(login);
        user.setPassword(passwordEncoder.encode(password));
        User saved = userRepository.save(user);
        UserDetailsImpl principal = new UserDetailsImpl(saved);
        return new AuthResponse(jwtService.generateToken(principal));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.login(), request.password()));
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        return new AuthResponse(jwtService.generateToken(principal));
    }
}
