package com.freqmanage.module.planning.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.planning.dto.PlanningCreateDTO;
import com.freqmanage.module.planning.dto.PlanningQueryDTO;
import com.freqmanage.module.planning.dto.PlanningUpdateDTO;
import com.freqmanage.module.planning.entity.RsbtPlanning;
import com.freqmanage.module.planning.mapper.PlanningMapper;
import com.freqmanage.module.planning.vo.PlanningOverviewVO;
import com.freqmanage.module.planning.vo.PlanningVO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PlanningService extends ServiceImpl<PlanningMapper, RsbtPlanning> {

    public PageResponse<PlanningVO> page(PlanningQueryDTO query) {
        Page<RsbtPlanning> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtPlanning> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getRadioservices())) {
            wrapper.eq(RsbtPlanning::getRadioservices, query.getRadioservices());
        }
        if (StringUtils.hasText(query.getSubservices())) {
            wrapper.eq(RsbtPlanning::getSubservices, query.getSubservices());
        }
        if (StringUtils.hasText(query.getLevel())) {
            wrapper.eq(RsbtPlanning::getLevel, query.getLevel());
        }
        if (StringUtils.hasText(query.getSegmentname())) {
            wrapper.eq(RsbtPlanning::getSegmentname, query.getSegmentname());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(RsbtPlanning::getRadioservices, query.getKeyword())
                    .or().like(RsbtPlanning::getSubservices, query.getKeyword())
                    .or().like(RsbtPlanning::getSegmentname, query.getKeyword());
        }
        wrapper.orderByDesc(RsbtPlanning::getGuid);
        IPage<RsbtPlanning> result = page(page, wrapper);
        List<PlanningVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public PlanningVO getById(String id) {
        RsbtPlanning entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(PlanningCreateDTO dto) {
        RsbtPlanning entity = new RsbtPlanning();
        entity.setGuid(UUID.randomUUID().toString());
        copyProperties(dto, entity);
        baseMapper.insert(entity);
    }

    public void update(String id, PlanningUpdateDTO dto) {
        RsbtPlanning entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        copyProperties(dto, entity);
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    public PlanningOverviewVO overview() {
        PlanningOverviewVO vo = new PlanningOverviewVO();
        vo.setTotalCount(baseMapper.selectCount(null));
        LambdaQueryWrapper<RsbtPlanning> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtPlanning::getStartfrequency).orderByAsc(RsbtPlanning::getStartfrequency).last("LIMIT 1");
        RsbtPlanning minFreq = baseMapper.selectOne(wrapper);
        vo.setMinFrequency(minFreq != null ? minFreq.getStartfrequency() : "0");

        wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtPlanning::getStopfrequency).orderByDesc(RsbtPlanning::getStopfrequency).last("LIMIT 1");
        RsbtPlanning maxFreq = baseMapper.selectOne(wrapper);
        vo.setMaxFrequency(maxFreq != null ? maxFreq.getStopfrequency() : "0");

        wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtPlanning::getRadioservices).groupBy(RsbtPlanning::getRadioservices);
        vo.setServiceTypeCount((long) baseMapper.selectList(wrapper).size());
        return vo;
    }

    public List<RsbtPlanning> listAll() {
        return baseMapper.selectList(null);
    }

    public void importData(InputStream inputStream) {
        List<RsbtPlanning> importList = new ArrayList<>();
        com.alibaba.excel.EasyExcel.read(inputStream, RsbtPlanning.class, new com.alibaba.excel.read.listener.PageReadListener<RsbtPlanning>(list -> {
            for (RsbtPlanning item : list) {
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

    private void copyProperties(Object src, RsbtPlanning target) {
        if (src instanceof PlanningCreateDTO) {
            PlanningCreateDTO dto = (PlanningCreateDTO) src;
            target.setRadioservices(dto.getRadioservices());
            target.setSubservices(dto.getSubservices());
            target.setLevel(dto.getLevel());
            target.setSegmentname(dto.getSegmentname());
            target.setStartfrequency(dto.getStartfrequency());
            target.setStopfrequency(dto.getStopfrequency());
            target.setStep(dto.getStep());
            target.setBandwidth(dto.getBandwidth());
            target.setRemark(dto.getRemark());
        } else if (src instanceof PlanningUpdateDTO) {
            PlanningUpdateDTO dto = (PlanningUpdateDTO) src;
            target.setRadioservices(dto.getRadioservices());
            target.setSubservices(dto.getSubservices());
            target.setLevel(dto.getLevel());
            target.setSegmentname(dto.getSegmentname());
            target.setStartfrequency(dto.getStartfrequency());
            target.setStopfrequency(dto.getStopfrequency());
            target.setStep(dto.getStep());
            target.setBandwidth(dto.getBandwidth());
            target.setRemark(dto.getRemark());
        }
    }

    private PlanningVO convertToVO(RsbtPlanning entity) {
        PlanningVO vo = new PlanningVO();
        vo.setGuid(entity.getGuid());
        vo.setRadioservices(entity.getRadioservices());
        vo.setSubservices(entity.getSubservices());
        vo.setLevel(entity.getLevel());
        vo.setSegmentname(entity.getSegmentname());
        vo.setStartfrequency(entity.getStartfrequency());
        vo.setStopfrequency(entity.getStopfrequency());
        vo.setStep(entity.getStep());
        vo.setBandwidth(entity.getBandwidth());
        vo.setRemark(entity.getRemark());
        return vo;
    }
}