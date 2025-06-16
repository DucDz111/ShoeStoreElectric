package org.example.shoestorebackend.controller;

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
            response.put("role", user.getRole().toString()); // Thêm role từ enum
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
            @RequestBody Map<String, String> request) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized: Token không hợp lệ"));
            }

            String token = authorizationHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            System.out.println("Update Profile Request - Email: " + email);

            User user = authService.getUserByEmail(email);

            // Cập nhật địa chỉ và số điện thoại
            String address = request.get("address");
            String phone = request.get("phone");

            if (address != null) {
                user.setAddress(address);
            }
            if (phone != null) {
                user.setPhone(phone);
            }

            // Lưu thay đổi vào database
            authService.updateUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("fullName", user.getFirstName() + " " + user.getLastName());
            response.put("phone", user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
            response.put("address", user.getAddress() != null ? user.getAddress() : "Vietnam");
            response.put("role", user.getRole().toString()); // Thêm role từ enum
            System.out.println("Update Profile Response: " + response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Update Profile error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi cập nhật thông tin hồ sơ: " + e.getMessage()));
        }
    }
}