package org.example.shoestorebackend.service;

import org.example.shoestorebackend.dto.LoginRequest;
import org.example.shoestorebackend.dto.RegisterRequest;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (request.getPhone() != null && userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already exists");
        }
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        try {
            System.out.println("Attempting login for email: " + request.getEmail());
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.isBlocked()) {
                throw new RuntimeException("Tài khoản của bạn đã bị chặn. Vui lòng liên hệ admin.");
            }
            System.out.println("Login successful for user: " + user.getEmail());
            return user;
        } catch (Exception e) {
            System.out.println("Login failed for email: " + request.getEmail() + ", error: " + e.getMessage());
            throw e;
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    // Thêm phương thức block/unblock
    public User blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setBlocked(true);
        return userRepository.save(user);
    }

    public User unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setBlocked(false);
        return userRepository.save(user);
    }

    // Thêm phương thức mới để lấy danh sách tất cả người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    // Thêm phương thức kiểm tra mật khẩu
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    // Thêm phương thức mã hóa mật khẩu
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}