package org.example.shoestorebackend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    @NotNull(message = "Họ là bắt buộc")
    @Size(min = 1, max = 50, message = "Họ phải từ 1 đến 50 ký tự")
    private String firstName;

    @Column(name = "last_name", nullable = false)
    @NotNull(message = "Tên là bắt buộc")
    @Size(min = 1, max = 50, message = "Tên phải từ 1 đến 50 ký tự")
    private String lastName;

    @Column(nullable = false, unique = true)
    @NotNull(message = "Số điện thoại là bắt buộc")
    @Size(min = 10, max = 15, message = "Số điện thoại phải từ 10 đến 15 ký tự")
    @Pattern(regexp = "^[0-9]+$", message = "Số điện thoại chỉ được chứa số")
    private String phone;

    @Column(nullable = false, unique = true)
    @NotNull(message = "Email là bắt buộc")
    @Email(message = "Email không hợp lệ")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    private String email;

    @Column(nullable = false)
    @NotNull(message = "Mật khẩu là bắt buộc")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @Column(name = "address")
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Vai trò là bắt buộc")
    private Role role;

    @Column(name = "is_blocked", nullable = false, columnDefinition = "boolean default false")
    @JsonProperty("isBlocked")
    private boolean isBlocked;

    public enum Role {
        ADMIN,
        USER
    }

    public User() {
        this.role = Role.USER;
        this.isBlocked = false;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isBlocked == false) isBlocked = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}