package org.example.shoestorebackend.controller;

import jakarta.validation.Valid;
import org.example.shoestorebackend.dto.ChangePasswordRequest;
import org.example.shoestorebackend.dto.RegisterRequest;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.service.AuthService;
import org.example.shoestorebackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized: Token không hợp lệ"));
            }

            String token = authorizationHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            System.out.println("Profile Request - Email: " + email);

            User user = authService.getUserByEmail(email);
            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("fullName", user.getFirstName() + " " + user.getLastName());
            response.put("phone", user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
            response.put("address", user.getAddress() != null ? user.getAddress() : "Vietnam");
            response.put("role", user.getRole().toString());
            System.out.println("Profile Response: " + response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Profile error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi lấy thông tin hồ sơ: " + e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody RegisterRequest request) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized: Token không hợp lệ"));
            }

            String token = authorizationHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            System.out.println("Update Profile Request - Email: " + email);

            User user = authService.getUserByEmail(email);

            // Cập nhật các trường từ request (chỉ sử dụng address và phone, bỏ qua các trường khác nếu gửi lên)
            if (request.getAddress() != null) {
                user.setAddress(request.getAddress());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }

            // Lưu thay đổi vào database
            authService.updateUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("fullName", user.getFirstName() + " " + user.getLastName());
            response.put("phone", user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
            response.put("address", user.getAddress() != null ? user.getAddress() : "Vietnam");
            response.put("role", user.getRole().toString());
            System.out.println("Update Profile Response: " + response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Update Profile error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi cập nhật thông tin hồ sơ: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized: Token không hợp lệ"));
            }

            String token = authorizationHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            System.out.println("Change Password Request - Email: " + email);

            String currentPassword = request.getCurrentPassword();
            String newPassword = request.getNewPassword();

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới"));
            }

            User user = authService.getUserByEmail(email);

            // Kiểm tra mật khẩu hiện tại
            if (!authService.checkPassword(currentPassword, user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Mật khẩu hiện tại không đúng"));
            }

            // Cập nhật mật khẩu mới
            user.setPassword(authService.encodePassword(newPassword));
            authService.updateUser(user);

            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (Exception e) {
            System.out.println("Change Password error: " + e.getMessage());
            // Nếu lỗi là do validation, thông báo sẽ được xử lý bởi GlobalExceptionHandler
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi đổi mật khẩu: " + e.getMessage()));
        }
    }
}