package com.freqmanage.module.permit.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.permit.dto.FrequencyCreateDTO;
import com.freqmanage.module.permit.dto.FrequencyUpdateDTO;
import com.freqmanage.module.permit.dto.PermitCreateDTO;
import com.freqmanage.module.permit.dto.PermitQueryDTO;
import com.freqmanage.module.permit.dto.PermitUpdateDTO;
import com.freqmanage.module.permit.dto.StationPermitCreateDTO;
import com.freqmanage.module.permit.dto.StationPermitUpdateDTO;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import com.freqmanage.module.permit.service.FrequencyService;
import com.freqmanage.module.permit.service.PermitService;
import com.freqmanage.module.permit.service.StationPermitService;
import com.freqmanage.module.permit.vo.FrequencyVO;
import com.freqmanage.module.permit.vo.PermitDetailVO;
import com.freqmanage.module.permit.vo.PermitVO;
import com.freqmanage.module.permit.vo.StationPermitVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/permit")
public class PermitController {
    private final PermitService permitService;
    private final FrequencyService frequencyService;
    private final StationPermitService stationPermitService;

    public PermitController(PermitService permitService, FrequencyService frequencyService, StationPermitService stationPermitService) {
        this.permitService = permitService;
        this.frequencyService = frequencyService;
        this.stationPermitService = stationPermitService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<PermitVO>> page(PermitQueryDTO query) {
        return ApiResponse.ok(permitService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<PermitVO> getById(@PathVariable String id) {
        return ApiResponse.ok(permitService.getById(id));
    }

    @GetMapping("/detail/{id}")
    public ApiResponse<PermitDetailVO> getDetail(@PathVariable String id) {
        return ApiResponse.ok(permitService.getDetail(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody PermitCreateDTO dto) {
        permitService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody PermitUpdateDTO dto) {
        permitService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        permitService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/export")
    public ApiResponse<List<RsbtSpecialPermit>> export() {
        return ApiResponse.ok(permitService.listAll());
    }

    @PostMapping("/import")
    public ApiResponse<Void> importData(@RequestParam("file") MultipartFile file) throws IOException {
        permitService.importData(file.getInputStream());
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtSpecialPermit>> list() {
        return ApiResponse.ok(permitService.listAll());
    }

    @GetMapping("/frequency/{permitId}")
    public ApiResponse<List<FrequencyVO>> getFrequencies(@PathVariable String permitId) {
        return ApiResponse.ok(frequencyService.getByPermitId(permitId));
    }

    @PostMapping("/frequency")
    public ApiResponse<Void> createFrequency(@Valid @RequestBody FrequencyCreateDTO dto) {
        frequencyService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/frequency/{id}")
    public ApiResponse<Void> updateFrequency(@PathVariable String id, @Valid @RequestBody FrequencyUpdateDTO dto) {
        frequencyService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/frequency/{id}")
    public ApiResponse<Void> deleteFrequency(@PathVariable String id) {
        frequencyService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/station-permit/{permitId}")
    public ApiResponse<List<StationPermitVO>> getStationPermits(@PathVariable String permitId) {
        return ApiResponse.ok(stationPermitService.getByPermitId(permitId));
    }

    @PostMapping("/station-permit")
    public ApiResponse<Void> createStationPermit(@Valid @RequestBody StationPermitCreateDTO dto) {
        stationPermitService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/station-permit/{id}")
    public ApiResponse<Void> updateStationPermit(@PathVariable String id, @Valid @RequestBody StationPermitUpdateDTO dto) {
        stationPermitService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/station-permit/{id}")
    public ApiResponse<Void> deleteStationPermit(@PathVariable String id) {
        stationPermitService.delete(id);
        return ApiResponse.ok();
    }
}