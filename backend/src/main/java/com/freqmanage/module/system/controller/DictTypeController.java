package com.freqmanage.module.system.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.DictTypeCreateDTO;
import com.freqmanage.module.system.dto.DictTypeQueryDTO;
import com.freqmanage.module.system.dto.DictTypeUpdateDTO;
import com.freqmanage.module.system.entity.RsbtDictType;
import com.freqmanage.module.system.service.DictTypeService;
import com.freqmanage.module.system.vo.DictTypeVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/dict/type")
public class DictTypeController {
    private final DictTypeService dictTypeService;

    public DictTypeController(DictTypeService dictTypeService) {
        this.dictTypeService = dictTypeService;
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<DictTypeVO>> page(DictTypeQueryDTO query) {
        return ApiResponse.ok(dictTypeService.page(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<DictTypeVO> getById(@PathVariable String id) {
        return ApiResponse.ok(dictTypeService.getById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody DictTypeCreateDTO dto) {
        dictTypeService.create(dto);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @Valid @RequestBody DictTypeUpdateDTO dto) {
        dictTypeService.update(id, dto);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        dictTypeService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/list")
    public ApiResponse<List<RsbtDictType>> list() {
        return ApiResponse.ok(dictTypeService.listAll());
    }
}
