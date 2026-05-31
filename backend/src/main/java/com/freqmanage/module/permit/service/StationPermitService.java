package com.freqmanage.module.permit.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.module.permit.dto.StationPermitCreateDTO;
import com.freqmanage.module.permit.dto.StationPermitUpdateDTO;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitStation;
import com.freqmanage.module.permit.mapper.SpecialPermitStationMapper;
import com.freqmanage.module.permit.vo.StationPermitVO;
import com.freqmanage.module.station.entity.RsbtStation;
import com.freqmanage.module.station.mapper.StationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StationPermitService extends ServiceImpl<SpecialPermitStationMapper, RsbtSpecialPermitStation> {

    @Autowired
    private StationMapper stationMapper;

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
        entity.setStationid(dto.getStationid());
        entity.setQuantity(dto.getQuantity());
        entity.setOutputpower(dto.getOutputpower());
        entity.setType(dto.getType());
        entity.setFrequencyLicense(dto.getFrequencyLicense());
        baseMapper.insert(entity);
    }

    public void update(String id, StationPermitUpdateDTO dto) {
        RsbtSpecialPermitStation entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        entity.setStationid(dto.getStationid());
        entity.setQuantity(dto.getQuantity());
        entity.setOutputpower(dto.getOutputpower());
        entity.setType(dto.getType());
        entity.setFrequencyLicense(dto.getFrequencyLicense());
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    private StationPermitVO convertToVO(RsbtSpecialPermitStation entity) {
        StationPermitVO vo = new StationPermitVO();
        vo.setGuid(entity.getGuid());
        vo.setPermitid(entity.getPermitid());
        vo.setStationid(entity.getStationid());
        vo.setQuantity(entity.getQuantity());
        vo.setOutputpower(entity.getOutputpower());
        vo.setType(entity.getType());
        vo.setFrequencyLicense(entity.getFrequencyLicense());

        // Fetch station details if stationid is set
        if (entity.getStationid() != null && !entity.getStationid().isEmpty()) {
            RsbtStation station = stationMapper.selectById(entity.getStationid());
            if (station != null) {
                vo.setStationName(station.getSitename());
                vo.setStationType(station.getStationtype());
                vo.setStationProvince(station.getProvince());
                vo.setStationUnit(station.getUnit());
            }
        }

        return vo;
    }
}