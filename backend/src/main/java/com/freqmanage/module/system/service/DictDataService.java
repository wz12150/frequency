package com.freqmanage.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.DictDataCreateDTO;
import com.freqmanage.module.system.dto.DictDataQueryDTO;
import com.freqmanage.module.system.dto.DictDataUpdateDTO;
import com.freqmanage.module.system.entity.RsbtDictData;
import com.freqmanage.module.system.entity.RsbtDictType;
import com.freqmanage.module.system.mapper.DictDataMapper;
import com.freqmanage.module.system.mapper.DictTypeMapper;
import com.freqmanage.module.system.vo.DictDataVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DictDataService extends ServiceImpl<DictDataMapper, RsbtDictData> {

    @Autowired
    private DictTypeMapper dictTypeMapper;

    public PageResponse<DictDataVO> page(DictDataQueryDTO query) {
        Page<RsbtDictData> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtDictData> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getTypeId())) {
            wrapper.eq(RsbtDictData::getTypeId, query.getTypeId());
        }
        if (StringUtils.hasText(query.getLabel())) {
            wrapper.like(RsbtDictData::getLabel, query.getLabel());
        }
        if (StringUtils.hasText(query.getValue())) {
            wrapper.eq(RsbtDictData::getValue, query.getValue());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(RsbtDictData::getLabel, query.getKeyword())
                    .or().like(RsbtDictData::getValue, query.getKeyword()));
        }
        wrapper.orderByAsc(RsbtDictData::getSort);
        wrapper.orderByDesc(RsbtDictData::getCreateTime);
        IPage<RsbtDictData> result = page(page, wrapper);
        List<DictDataVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public DictDataVO getById(String id) {
        RsbtDictData entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(DictDataCreateDTO dto) {
        RsbtDictData entity = new RsbtDictData();
        copyProperties(dto, entity);
        baseMapper.insert(entity);
    }

    public void update(String id, DictDataUpdateDTO dto) {
        RsbtDictData entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        copyProperties(dto, entity);
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    public List<RsbtDictData> listByTypeId(String typeId) {
        LambdaQueryWrapper<RsbtDictData> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtDictData::getTypeId, typeId);
        wrapper.orderByAsc(RsbtDictData::getSort);
        return baseMapper.selectList(wrapper);
    }

    private void copyProperties(Object src, RsbtDictData target) {
        if (src instanceof DictDataCreateDTO) {
            DictDataCreateDTO dto = (DictDataCreateDTO) src;
            target.setTypeId(dto.getTypeId());
            target.setLabel(dto.getLabel());
            target.setValue(dto.getValue());
            target.setSort(dto.getSort() != null ? dto.getSort() : 0);
            target.setStatus(dto.getStatus() != null ? dto.getStatus() : "enabled");
            target.setRemark(dto.getRemark());
        } else if (src instanceof DictDataUpdateDTO) {
            DictDataUpdateDTO dto = (DictDataUpdateDTO) src;
            target.setTypeId(dto.getTypeId());
            target.setLabel(dto.getLabel());
            target.setValue(dto.getValue());
            target.setSort(dto.getSort());
            target.setStatus(dto.getStatus());
            target.setRemark(dto.getRemark());
        }
    }

    private DictDataVO convertToVO(RsbtDictData entity) {
        DictDataVO vo = new DictDataVO();
        vo.setGuid(entity.getGuid());
        vo.setTypeId(entity.getTypeId());
        vo.setLabel(entity.getLabel());
        vo.setValue(entity.getValue());
        vo.setSort(entity.getSort());
        vo.setStatus(entity.getStatus());
        vo.setRemark(entity.getRemark());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());

        RsbtDictType dictType = dictTypeMapper.selectById(entity.getTypeId());
        if (dictType != null) {
            vo.setTypeName(dictType.getName());
        }

        return vo;
    }
}
