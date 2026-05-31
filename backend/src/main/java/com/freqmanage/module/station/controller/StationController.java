package com.freqmanage.module.station.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.module.station.dto.StationCreateDTO;
import com.freqmanage.module.station.dto.StationQueryDTO;
import com.freqmanage.module.station.dto.StationUpdateDTO;
import com.freqmanage.module.station.entity.RsbtStation;
import com.freqmanage.module.station.service.StationService;
import com.freqmanage.module.station.vo.StationMapVO;
import com.freqmanage.module.station.vo.StationSelectVO;
import com.freqmanage.module.station.vo.StationStatsVO;
import com.freqmanage.module.station.vo.StationVO;
import com.freqmanage.common.PageResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/station")
public class StationController {
    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<StationVO>> page(StationQueryDTO query) {
        return ApiResponse.ok(stationService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<StationVO> getById(@PathVariable String id) {
        return ApiResponse.ok(stationService.getById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody StationCreateDTO dto) {
        stationService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody StationUpdateDTO dto) {
        stationService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        stationService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/map")
    public ApiResponse<List<StationMapVO>> getMapPoints() {
        return ApiResponse.ok(stationService.getMapPoints());
    }

    @GetMapping("/stats")
    public ApiResponse<StationStatsVO> getStats() {
        return ApiResponse.ok(stationService.getStats());
    }

    @GetMapping("/export")
    public ApiResponse<List<RsbtStation>> export() {
        return ApiResponse.ok(stationService.listAll());
    }

    @PostMapping("/import")
    public ApiResponse<Void> importData(@RequestParam("file") MultipartFile file) throws IOException {
        stationService.importData(file.getInputStream());
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtStation>> list() {
        return ApiResponse.ok(stationService.listAll());
    }

    @GetMapping("/select-list")
    public ApiResponse<List<StationSelectVO>> selectList() {
        return ApiResponse.ok(stationService.getSelectList());
    }

    @GetMapping("/region-detail")
    public ApiResponse<PageResponse<StationVO>> getRegionDetail(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String province) {
        StationQueryDTO query = new StationQueryDTO();
        query.setType(type);
        query.setProvince(province);
        return ApiResponse.ok(stationService.page(query));
    }
}