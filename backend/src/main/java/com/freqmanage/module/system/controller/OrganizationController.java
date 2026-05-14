package com.freqmanage.module.system.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.OrganizationCreateDTO;
import com.freqmanage.module.system.dto.OrganizationQueryDTO;
import com.freqmanage.module.system.dto.OrganizationUpdateDTO;
import com.freqmanage.module.system.entity.RsbtOrganization;
import com.freqmanage.module.system.service.OrganizationService;
import com.freqmanage.module.system.vo.OrganizationVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/organization")
public class OrganizationController {
    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<OrganizationVO>> page(OrganizationQueryDTO query) {
        return ApiResponse.ok(organizationService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrganizationVO> getById(@PathVariable String id) {
        return ApiResponse.ok(organizationService.getById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody OrganizationCreateDTO dto) {
        organizationService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody OrganizationUpdateDTO dto) {
        organizationService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        organizationService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtOrganization>> list() {
        return ApiResponse.ok(organizationService.listAll());
    }
}