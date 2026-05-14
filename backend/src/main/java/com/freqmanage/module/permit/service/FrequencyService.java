package com.freqmanage.module.permit.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.module.permit.dto.FrequencyCreateDTO;
import com.freqmanage.module.permit.dto.FrequencyUpdateDTO;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitFrequency;
import com.freqmanage.module.permit.mapper.SpecialPermitFrequencyMapper;
import com.freqmanage.module.permit.vo.FrequencyVO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FrequencyService extends ServiceImpl<SpecialPermitFrequencyMapper, RsbtSpecialPermitFrequency> {

    public List<FrequencyVO> getByPermitId(String permitId) {
        LambdaQueryWrapper<RsbtSpecialPermitFrequency> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtSpecialPermitFrequency::getPermitid, permitId);
        return baseMapper.selectList(wrapper).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    public FrequencyVO getById(String id) {
        RsbtSpecialPermitFrequency entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(FrequencyCreateDTO dto) {
        RsbtSpecialPermitFrequency entity = new RsbtSpecialPermitFrequency();
        entity.setGuid(UUID.randomUUID().toString());
        entity.setPermitid(dto.getPermitid());
        entity.setFrequency(dto.getFrequency());
        entity.setBadnwidth(dto.getBadnwidth());
        baseMapper.insert(entity);
    }

    public void update(String id, FrequencyUpdateDTO dto) {
        RsbtSpecialPermitFrequency entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        entity.setFrequency(dto.getFrequency());
        entity.setBadnwidth(dto.getBadnwidth());
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    private FrequencyVO convertToVO(RsbtSpecialPermitFrequency entity) {
        FrequencyVO vo = new FrequencyVO();
        vo.setGuid(entity.getGuid());
        vo.setPermitid(entity.getPermitid());
        vo.setFrequency(entity.getFrequency());
        vo.setBadnwidth(entity.getBadnwidth());
        return vo;
    }
}