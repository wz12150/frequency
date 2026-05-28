package com.freqmanage.module.auth;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.BizException;
import com.freqmanage.module.system.entity.RsbtRole;
import com.freqmanage.module.system.entity.RsbtUser;
import com.freqmanage.module.system.service.UserService;
import com.freqmanage.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtUtil jwtUtil, UserService userService, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        RsbtUser user = userService.getByUsernameEntity(request.getUsername());
        if (user == null) {
            throw new BizException(401, "用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BizException(401, "用户名或密码错误");
        }
        if (!"active".equals(user.getStatus())) {
            throw new BizException(401, "用户已被禁用");
        }
        String token = jwtUtil.generate(user.getUsername());

        // Get user roles and permissions
        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();
        if (user.getRoleId() != null) {
            RsbtRole role = userService.getRoleById(user.getRoleId());
            if (role != null) {
                roles.add(role.getName().toUpperCase());
                permissions = userService.getPermissionsByUserId(user.getGuid());
            }
        }

        return ApiResponse.ok(Map.of(
            "token", token,
            "tokenType", "Bearer",
            "username", user.getUsername(),
            "guid", user.getGuid(),
            "name", user.getName() != null ? user.getName() : user.getUsername(),
            "email", user.getEmail() != null ? user.getEmail() : "",
            "phone", user.getPhone() != null ? user.getPhone() : "",
            "roles", roles,
            "permissions", permissions
        ));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok();
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null) {
            return ApiResponse.ok(Map.of("username", "anonymous", "nickname", "Anonymous", "roles", new String[]{}));
        }
        String username = authentication.getName();
        RsbtUser user = userService.getByUsernameEntity(username);
        if (user == null) {
            return ApiResponse.ok(Map.of("username", username, "roles", new String[]{"USER"}));
        }

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();
        if (user.getRoleId() != null) {
            RsbtRole role = userService.getRoleById(user.getRoleId());
            if (role != null) {
                roles.add(role.getName().toUpperCase());
                permissions = userService.getPermissionsByUserId(user.getGuid());
            }
        }
        return ApiResponse.ok(Map.of(
            "username", user.getUsername(),
            "name", user.getName() != null ? user.getName() : user.getUsername(),
            "email", user.getEmail() != null ? user.getEmail() : "",
            "phone", user.getPhone() != null ? user.getPhone() : "",
            "roles", roles,
            "permissions", permissions
        ));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new BizException(401, "未登录");
        }
        userService.changePassword(authentication.getName(), request.getOldPassword(), request.getNewPassword());
        return ApiResponse.ok();
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String oldPassword;
        @NotBlank
        private String newPassword;
    }
}
