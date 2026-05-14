package com.freqmanage.module.permit.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.permit.dto.*;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitFrequency;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitStation;
import com.freqmanage.module.permit.mapper.SpecialPermitFrequencyMapper;
import com.freqmanage.module.permit.mapper.SpecialPermitMapper;
import com.freqmanage.module.permit.mapper.SpecialPermitStationMapper;
import com.freqmanage.module.permit.vo.FrequencyVO;
import com.freqmanage.module.permit.vo.PermitDetailVO;
import com.freqmanage.module.permit.vo.PermitVO;
import com.freqmanage.module.permit.vo.StationPermitVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermitService extends ServiceImpl<SpecialPermitMapper, RsbtSpecialPermit> {

    private final SpecialPermitFrequencyMapper frequencyMapper;
    private final SpecialPermitStationMapper stationPermitMapper;

    public PermitService(SpecialPermitFrequencyMapper frequencyMapper, SpecialPermitStationMapper stationPermitMapper) {
        this.frequencyMapper = frequencyMapper;
        this.stationPermitMapper = stationPermitMapper;
    }

    public PageResponse<PermitVO> page(PermitQueryDTO query) {
        Page<RsbtSpecialPermit> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getConsent())) {
            wrapper.eq(RsbtSpecialPermit::getConsent, query.getConsent());
        }
        if (StringUtils.hasText(query.getCategory())) {
            wrapper.eq(RsbtSpecialPermit::getCategory, query.getCategory());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(RsbtSpecialPermit::getStatus, query.getStatus());
        }
        if (StringUtils.hasText(query.getType())) {
            wrapper.eq(RsbtSpecialPermit::getType, query.getType());
        }
        if (query.getStartDateFrom() != null) {
            wrapper.ge(RsbtSpecialPermit::getStartdate, query.getStartDateFrom());
        }
        if (query.getStartDateTo() != null) {
            wrapper.le(RsbtSpecialPermit::getStartdate, query.getStartDateTo());
        }
        if (query.getEndDateFrom() != null) {
            wrapper.ge(RsbtSpecialPermit::getEnddate, query.getEndDateFrom());
        }
        if (query.getEndDateTo() != null) {
            wrapper.le(RsbtSpecialPermit::getEnddate, query.getEndDateTo());
        }
        if (StringUtils.hasText(query.getProvince())) {
            wrapper.like(RsbtSpecialPermit::getScope, query.getProvince());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(RsbtSpecialPermit::getConsent, query.getKeyword())
                    .or().like(RsbtSpecialPermit::getInterlocutor, query.getKeyword())
                    .or().like(RsbtSpecialPermit::getCode, query.getKeyword());
        }
        wrapper.orderByDesc(RsbtSpecialPermit::getGuid);
        IPage<RsbtSpecialPermit> result = page(page, wrapper);
        List<PermitVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public PermitVO getById(String id) {
        RsbtSpecialPermit entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public PermitDetailVO getDetail(String id) {
        RsbtSpecialPermit entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }

        PermitDetailVO detail = new PermitDetailVO();
        detail.setPermit(convertToVO(entity));

        LambdaQueryWrapper<RsbtSpecialPermitFrequency> freqWrapper = new LambdaQueryWrapper<>();
        freqWrapper.eq(RsbtSpecialPermitFrequency::getPermitid, id);
        List<RsbtSpecialPermitFrequency> frequencies = frequencyMapper.selectList(freqWrapper);
        detail.setFrequencies(frequencies.stream().map(this::convertToFreqVO).collect(Collectors.toList()));

        LambdaQueryWrapper<RsbtSpecialPermitStation> stationWrapper = new LambdaQueryWrapper<>();
        stationWrapper.eq(RsbtSpecialPermitStation::getPermitid, id);
        List<RsbtSpecialPermitStation> stations = stationPermitMapper.selectList(stationWrapper);
        detail.setStations(stations.stream().map(this::convertToStationVO).collect(Collectors.toList()));

        return detail;
    }

    public void create(PermitCreateDTO dto) {
        RsbtSpecialPermit entity = new RsbtSpecialPermit();
        entity.setGuid(UUID.randomUUID().toString());
        copyProperties(dto, entity);
        baseMapper.insert(entity);
    }

    public void update(String id, PermitUpdateDTO dto) {
        RsbtSpecialPermit entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        copyProperties(dto, entity);
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        LambdaQueryWrapper<RsbtSpecialPermitFrequency> freqWrapper = new LambdaQueryWrapper<>();
        freqWrapper.eq(RsbtSpecialPermitFrequency::getPermitid, id);
        frequencyMapper.delete(freqWrapper);

        LambdaQueryWrapper<RsbtSpecialPermitStation> stationWrapper = new LambdaQueryWrapper<>();
        stationWrapper.eq(RsbtSpecialPermitStation::getPermitid, id);
        stationPermitMapper.delete(stationWrapper);

        baseMapper.deleteById(id);
    }

    public List<RsbtSpecialPermit> listAll() {
        return baseMapper.selectList(null);
    }

    public void importData(InputStream inputStream) {
        List<RsbtSpecialPermit> importList = new ArrayList<>();
        com.alibaba.excel.EasyExcel.read(inputStream, RsbtSpecialPermit.class, new com.alibaba.excel.read.listener.PageReadListener<RsbtSpecialPermit>(list -> {
            for (RsbtSpecialPermit item : list) {
                if (item.getGuid() == null || item.getGuid().isEmpty()) {
                    item.setGuid(UUID.randomUUID().toString());
                }
                importList.add(item);
            }
        })).sheet().doRead();
        if (!importList.isEmpty()) {
            saveBatch(importList);
        }
    }

    private void copyProperties(Object src, RsbtSpecialPermit target) {
        if (src instanceof PermitCreateDTO) {
            PermitCreateDTO dto = (PermitCreateDTO) src;
            target.setConsent(dto.getConsent());
            target.setInterlocutor(dto.getInterlocutor());
            target.setCategory(dto.getCategory());
            target.setLegal(dto.getLegal());
            target.setType(dto.getType());
            target.setStartdate(dto.getStartdate());
            target.setEnddate(dto.getEnddate());
            target.setScope(dto.getScope());
            target.setProcess(dto.getProcess());
            target.setStatus(dto.getStatus());
            target.setCode(dto.getCode());
            target.setDecisiondate(dto.getDecisiondate());
            target.setDecision(dto.getDecision());
            target.setNote(dto.getNote());
            target.setRegister(dto.getRegister());
            target.setAddress(dto.getAddress());
            target.setPhone(dto.getPhone());
            target.setEmail(dto.getEmail());
            target.setAdministrativeinfo(dto.getAdministrativeinfo());
            target.setDirectorname(dto.getDirectorname());
        } else if (src instanceof PermitUpdateDTO) {
            PermitUpdateDTO dto = (PermitUpdateDTO) src;
            target.setConsent(dto.getConsent());
            target.setInterlocutor(dto.getInterlocutor());
            target.setCategory(dto.getCategory());
            target.setLegal(dto.getLegal());
            target.setType(dto.getType());
            target.setStartdate(dto.getStartdate());
            target.setEnddate(dto.getEnddate());
            target.setScope(dto.getScope());
            target.setProcess(dto.getProcess());
            target.setStatus(dto.getStatus());
            target.setCode(dto.getCode());
            target.setDecisiondate(dto.getDecisiondate());
            target.setDecision(dto.getDecision());
            target.setNote(dto.getNote());
            target.setRegister(dto.getRegister());
            target.setAddress(dto.getAddress());
            target.setPhone(dto.getPhone());
            target.setEmail(dto.getEmail());
            target.setAdministrativeinfo(dto.getAdministrativeinfo());
            target.setDirectorname(dto.getDirectorname());
        }
    }

    private PermitVO convertToVO(RsbtSpecialPermit entity) {
        PermitVO vo = new PermitVO();
        vo.setGuid(entity.getGuid());
        vo.setConsent(entity.getConsent());
        vo.setInterlocutor(entity.getInterlocutor());
        vo.setCategory(entity.getCategory());
        vo.setLegal(entity.getLegal());
        vo.setType(entity.getType());
        vo.setStartdate(entity.getStartdate());
        vo.setEnddate(entity.getEnddate());
        vo.setScope(entity.getScope());
        vo.setProcess(entity.getProcess());
        vo.setStatus(entity.getStatus());
        vo.setCode(entity.getCode());
        vo.setDecisiondate(entity.getDecisiondate());
        vo.setDecision(entity.getDecision());
        vo.setNote(entity.getNote());
        vo.setRegister(entity.getRegister());
        vo.setAddress(entity.getAddress());
        vo.setPhone(entity.getPhone());
        vo.setEmail(entity.getEmail());
        vo.setAdministrativeinfo(entity.getAdministrativeinfo());
        vo.setDirectorname(entity.getDirectorname());
        return vo;
    }

    private FrequencyVO convertToFreqVO(RsbtSpecialPermitFrequency entity) {
        FrequencyVO vo = new FrequencyVO();
        vo.setGuid(entity.getGuid());
        vo.setPermitid(entity.getPermitid());
        vo.setFrequency(entity.getFrequency());
        vo.setBadnwidth(entity.getBadnwidth());
        return vo;
    }

    private StationPermitVO convertToStationVO(RsbtSpecialPermitStation entity) {
        StationPermitVO vo = new StationPermitVO();
        vo.setGuid(entity.getGuid());
        vo.setPermitid(entity.getPermitid());
        vo.setQuantity(entity.getQuantity());
        vo.setOutputpower(entity.getOutputpower());
        vo.setType(entity.getType());
        return vo;
    }
}