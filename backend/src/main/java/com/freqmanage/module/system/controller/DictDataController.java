package com.freqmanage.module.system.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.DictDataCreateDTO;
import com.freqmanage.module.system.dto.DictDataQueryDTO;
import com.freqmanage.module.system.dto.DictDataUpdateDTO;
import com.freqmanage.module.system.entity.RsbtDictData;
import com.freqmanage.module.system.service.DictDataService;
import com.freqmanage.module.system.vo.DictDataVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/dict/data")
public class DictDataController {
    private final DictDataService dictDataService;

    public DictDataController(DictDataService dictDataService) {
        this.dictDataService = dictDataService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<DictDataVO>> page(DictDataQueryDTO query) {
        return ApiResponse.ok(dictDataService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<DictDataVO> getById(@PathVariable String id) {
        return ApiResponse.ok(dictDataService.getById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody DictDataCreateDTO dto) {
        dictDataService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody DictDataUpdateDTO dto) {
        dictDataService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        dictDataService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtDictData>> list(@RequestParam String typeId) {
        return ApiResponse.ok(dictDataService.listByTypeId(typeId));
    }
}
