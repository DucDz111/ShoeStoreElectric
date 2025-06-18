package org.example.shoestorebackend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {
    @NotNull(message = "Mật khẩu hiện tại là bắt buộc")
    private String currentPassword;

    @NotNull(message = "Mật khẩu mới là bắt buộc")
    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
    private String newPassword;

    public @NotNull(message = "Mật khẩu hiện tại là bắt buộc") String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(@NotNull(message = "Mật khẩu hiện tại là bắt buộc") String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public @NotNull(message = "Mật khẩu mới là bắt buộc") @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự") String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(@NotNull(message = "Mật khẩu mới là bắt buộc") @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự") String newPassword) {
        this.newPassword = newPassword;
    }
}
