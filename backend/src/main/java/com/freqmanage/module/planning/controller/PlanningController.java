package com.freqmanage.module.planning.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.module.planning.dto.PlanningCreateDTO;
import com.freqmanage.module.planning.dto.PlanningQueryDTO;
import com.freqmanage.module.planning.dto.PlanningUpdateDTO;
import com.freqmanage.module.planning.entity.RsbtPlanning;
import com.freqmanage.module.planning.service.PlanningService;
import com.freqmanage.module.planning.vo.PlanningOverviewVO;
import com.freqmanage.module.planning.vo.PlanningVO;
import com.freqmanage.common.PageResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/planning")
public class PlanningController {
    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<PlanningVO>> page(PlanningQueryDTO query) {
        return ApiResponse.ok(planningService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<PlanningVO> getById(@PathVariable String id) {
        return ApiResponse.ok(planningService.getById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody PlanningCreateDTO dto) {
        planningService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody PlanningUpdateDTO dto) {
        planningService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        planningService.delete(id);
        return ApiResponse.ok();
    }

    @DeleteMapping("/deleteAll")
    public ApiResponse<Void> deleteAll() {
        planningService.deleteAll();
        return ApiResponse.ok();
    }

    @GetMapping("/overview")
    public ApiResponse<PlanningOverviewVO> overview() {
        return ApiResponse.ok(planningService.overview());
    }

    @GetMapping("/export")
    public ApiResponse<List<RsbtPlanning>> export() {
        return ApiResponse.ok(planningService.listAll());
    }

    @PostMapping("/import")
    public ApiResponse<Void> importData(@RequestParam("file") MultipartFile file) throws IOException {
        planningService.importData(file.getInputStream());
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtPlanning>> list() {
        return ApiResponse.ok(planningService.listAll());
    }
}