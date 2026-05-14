package com.freqmanage.module.permit.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.module.permit.dto.StationPermitCreateDTO;
import com.freqmanage.module.permit.dto.StationPermitUpdateDTO;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitStation;
import com.freqmanage.module.permit.mapper.SpecialPermitStationMapper;
import com.freqmanage.module.permit.vo.StationPermitVO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StationPermitService extends ServiceImpl<SpecialPermitStationMapper, RsbtSpecialPermitStation> {

    public List<StationPermitVO> getByPermitId(String permitId) {
        LambdaQueryWrapper<RsbtSpecialPermitStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtSpecialPermitStation::getPermitid, permitId);
        return baseMapper.selectList(wrapper).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    public StationPermitVO getById(String id) {
        RsbtSpecialPermitStation entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(StationPermitCreateDTO dto) {
        RsbtSpecialPermitStation entity = new RsbtSpecialPermitStation();
        entity.setGuid(UUID.randomUUID().toString());
        entity.setPermitid(dto.getPermitid());
        entity.setQuantity(dto.getQuantity());
        entity.setOutputpower(dto.getOutputpower());
        entity.setType(dto.getType());
        baseMapper.insert(entity);
    }

    public void update(String id, StationPermitUpdateDTO dto) {
        RsbtSpecialPermitStation entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        entity.setQuantity(dto.getQuantity());
        entity.setOutputpower(dto.getOutputpower());
        entity.setType(dto.getType());
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    private StationPermitVO convertToVO(RsbtSpecialPermitStation entity) {
        StationPermitVO vo = new StationPermitVO();
        vo.setGuid(entity.getGuid());
        vo.setPermitid(entity.getPermitid());
        vo.setQuantity(entity.getQuantity());
        vo.setOutputpower(entity.getOutputpower());
        vo.setType(entity.getType());
        return vo;
    }
}