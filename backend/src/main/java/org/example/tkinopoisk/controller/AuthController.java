package org.example.tkinopoisk.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.repository.UserRepository;
import org.example.tkinopoisk.security.UserDetailsImpl;
import org.example.tkinopoisk.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public record MePayload(boolean authenticated, Long id, String login) {}

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

    public record RegisterRequest(String login, String password) {}
    public record LoginRequest(String login, String password) {}
    public record OkResponse(String message) {}

    @PostMapping("/register")
    public OkResponse register(@RequestBody RegisterRequest request, HttpServletResponse response) {
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

        String token = jwtService.generateToken(principal);
        setAuthCookie(response, token);
        return new OkResponse("OK");
    }

    @PostMapping("/login")
    public OkResponse login(@RequestBody LoginRequest request, HttpServletResponse response) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.login(), request.password()));

        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();

        String token = jwtService.generateToken(principal);
        setAuthCookie(response, token);
        return new OkResponse("OK");
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    @GetMapping("/me")
    public MePayload me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl principal)) {
            return new MePayload(false, null, null);
        }
        return new MePayload(true, principal.getUserId(), principal.getUsername());
    }

    private void setAuthCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("auth_token", token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 60 * 24)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}