package com.freqmanage.module.system.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.UserCreateDTO;
import com.freqmanage.module.system.dto.UserQueryDTO;
import com.freqmanage.module.system.dto.UserUpdateDTO;
import com.freqmanage.module.system.entity.RsbtUser;
import com.freqmanage.module.system.service.UserService;
import com.freqmanage.module.system.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<UserVO>> page(UserQueryDTO query) {
        return ApiResponse.ok(userService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserVO> getById(@PathVariable String id) {
        return ApiResponse.ok(userService.getById(id));
    }

    @GetMapping("/username/{username}")
    public ApiResponse<UserVO> getByUsername(@PathVariable String username) {
        return ApiResponse.ok(userService.getByUsername(username));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody UserCreateDTO dto) {
        userService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody UserUpdateDTO dto) {
        userService.update(id, dto);
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable String id, @RequestParam String newPassword) {
        userService.resetPassword(id, newPassword);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        userService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtUser>> list() {
        return ApiResponse.ok(userService.listAll());
    }
}