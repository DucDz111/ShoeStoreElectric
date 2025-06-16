package org.example.shoestorebackend.controller;

import jakarta.validation.Valid;
import org.example.shoestorebackend.dto.LoginRequest;
import org.example.shoestorebackend.dto.RegisterRequest;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.service.AuthService;
import org.example.shoestorebackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = result.getFieldErrors().stream().collect(Collectors.toMap(
                    fieldError -> fieldError.getField(), fieldError -> fieldError.getDefaultMessage()
            ));
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            User user = authService.register(request);
            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phone", user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
            response.put("address", user.getAddress() != null ? user.getAddress() : "Vietnam");
            response.put("role", user.getRole().toString());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = result.getFieldErrors().stream()
                    .collect(Collectors.toMap(fieldError -> fieldError.getField(), fieldError -> fieldError.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            User user = authService.login(request);
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().toString());
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phone", user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
            response.put("address", user.getAddress() != null ? user.getAddress() : "Vietnam");
            response.put("role", user.getRole().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Đăng nhập thất bại: Tài khoản hoặc mật khẩu không đúng"));
        }
    }
}