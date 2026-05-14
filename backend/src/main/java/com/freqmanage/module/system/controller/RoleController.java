package com.freqmanage.module.system.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.RoleCreateDTO;
import com.freqmanage.module.system.dto.RoleQueryDTO;
import com.freqmanage.module.system.dto.RoleUpdateDTO;
import com.freqmanage.module.system.entity.RsbtRole;
import com.freqmanage.module.system.service.RoleService;
import com.freqmanage.module.system.vo.RoleVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/role")
public class RoleController {
    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<RoleVO>> page(RoleQueryDTO query) {
        return ApiResponse.ok(roleService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<RoleVO> getById(@PathVariable String id) {
        return ApiResponse.ok(roleService.getById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody RoleCreateDTO dto) {
        roleService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody RoleUpdateDTO dto) {
        roleService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        roleService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtRole>> list() {
        return ApiResponse.ok(roleService.listAll());
    }

    @GetMapping("/{id}/permissions")
    public ApiResponse<List<String>> getPermissions(@PathVariable String id) {
        return ApiResponse.ok(roleService.getPermissionsByRoleId(id));
    }
}