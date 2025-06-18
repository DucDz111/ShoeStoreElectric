package org.example.shoestorebackend.admincontroller;

import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    @Autowired
    private AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Chặn người dùng
    @PutMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> blockUser(@PathVariable Long id) {
        User user = authService.blockUser(id);
        return ResponseEntity.ok(user);
    }

    // Mở chặn người dùng
    @PutMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> unblockUser(@PathVariable Long id) {
        User user = authService.unblockUser(id);
        return ResponseEntity.ok(user);
    }
}