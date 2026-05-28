package com.freqmanage.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.DictTypeCreateDTO;
import com.freqmanage.module.system.dto.DictTypeQueryDTO;
import com.freqmanage.module.system.dto.DictTypeUpdateDTO;
import com.freqmanage.module.system.entity.RsbtDictType;
import com.freqmanage.module.system.mapper.DictTypeMapper;
import com.freqmanage.module.system.vo.DictTypeVO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DictTypeService extends ServiceImpl<DictTypeMapper, RsbtDictType> {

    public PageResponse<DictTypeVO> page(DictTypeQueryDTO query) {
        Page<RsbtDictType> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtDictType> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getName())) {
            wrapper.like(RsbtDictType::getName, query.getName());
        }
        if (StringUtils.hasText(query.getCode())) {
            wrapper.eq(RsbtDictType::getCode, query.getCode());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(RsbtDictType::getName, query.getKeyword())
                    .or().like(RsbtDictType::getCode, query.getKeyword()));
        }
        wrapper.orderByDesc(RsbtDictType::getCreateTime);
        IPage<RsbtDictType> result = page(page, wrapper);
        List<DictTypeVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public DictTypeVO getById(String id) {
        RsbtDictType entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(DictTypeCreateDTO dto) {
        RsbtDictType entity = new RsbtDictType();
        copyProperties(dto, entity);
        checkCodeUniqueness(dto.getCode(), null);
        baseMapper.insert(entity);
    }

    public void update(String id, DictTypeUpdateDTO dto) {
        RsbtDictType entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        checkCodeUniqueness(dto.getCode(), id);
        copyProperties(dto, entity);
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    public List<RsbtDictType> listAll() {
        return baseMapper.selectList(null);
    }

    private void copyProperties(Object src, RsbtDictType target) {
        if (src instanceof DictTypeCreateDTO) {
            DictTypeCreateDTO dto = (DictTypeCreateDTO) src;
            target.setName(dto.getName());
            target.setCode(dto.getCode());
            target.setDescription(dto.getDescription());
            target.setStatus(dto.getStatus() != null ? dto.getStatus() : "enabled");
        } else if (src instanceof DictTypeUpdateDTO) {
            DictTypeUpdateDTO dto = (DictTypeUpdateDTO) src;
            target.setName(dto.getName());
            target.setCode(dto.getCode());
            target.setDescription(dto.getDescription());
            target.setStatus(dto.getStatus());
        }
    }

    private DictTypeVO convertToVO(RsbtDictType entity) {
        DictTypeVO vo = new DictTypeVO();
        vo.setGuid(entity.getGuid());
        vo.setName(entity.getName());
        vo.setCode(entity.getCode());
        vo.setDescription(entity.getDescription());
        vo.setStatus(entity.getStatus());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }

    private void checkCodeUniqueness(String code, String excludeId) {
        if (!StringUtils.hasText(code)) {
            return;
        }
        LambdaQueryWrapper<RsbtDictType> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtDictType::getCode, code);
        if (StringUtils.hasText(excludeId)) {
            wrapper.ne(RsbtDictType::getGuid, excludeId);
        }
        long count = baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BizException(400, "字典类型编码已存在");
        }
    }
}
