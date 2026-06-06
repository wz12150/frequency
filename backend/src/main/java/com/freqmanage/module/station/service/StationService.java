package com.freqmanage.module.station.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.station.dto.StationCreateDTO;
import com.freqmanage.module.station.dto.StationQueryDTO;
import com.freqmanage.module.station.dto.StationUpdateDTO;
import com.freqmanage.module.station.entity.RsbtStation;
import com.freqmanage.module.station.mapper.StationMapper;
import com.freqmanage.module.station.vo.StationMapVO;
import com.freqmanage.module.station.vo.StationSelectVO;
import com.freqmanage.module.station.vo.StationStatsVO;
import com.freqmanage.module.station.vo.StationVO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StationService extends ServiceImpl<StationMapper, RsbtStation> {

    public PageResponse<StationVO> page(StationQueryDTO query) {
        Page<RsbtStation> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getType())) {
            // Match both TYPE (e.g. "Macro") and STATIONTYPE (e.g. "Base Station") fields
            wrapper.and(w -> w
                .eq(RsbtStation::getType, query.getType())
                .or().eq(RsbtStation::getStationtype, query.getType())
            );
        }
        if (StringUtils.hasText(query.getTechnology())) {
            wrapper.eq(RsbtStation::getTechnology, query.getTechnology());
        }
        if (StringUtils.hasText(query.getProvince())) {
            wrapper.eq(RsbtStation::getProvince, query.getProvince());
        }
        if (StringUtils.hasText(query.getDistrict())) {
            wrapper.eq(RsbtStation::getDistrict, query.getDistrict());
        }
        if (StringUtils.hasText(query.getStationtype())) {
            wrapper.eq(RsbtStation::getStationtype, query.getStationtype());
        }
        if (query.getStartDateFrom() != null) {
            wrapper.ge(RsbtStation::getStartdate, query.getStartDateFrom());
        }
        if (query.getStartDateTo() != null) {
            wrapper.le(RsbtStation::getStartdate, query.getStartDateTo());
        }
        if (query.getExpirationDateFrom() != null) {
            wrapper.ge(RsbtStation::getExpirationdate, query.getExpirationDateFrom());
        }
        if (query.getExpirationDateTo() != null) {
            wrapper.le(RsbtStation::getExpirationdate, query.getExpirationDateTo());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(RsbtStation::getSitename, query.getKeyword())
                    .or().like(RsbtStation::getLocation, query.getKeyword())
                    .or().like(RsbtStation::getProvince, query.getKeyword());
        }
        wrapper.orderByDesc(RsbtStation::getGuid);
        IPage<RsbtStation> result = page(page, wrapper);
        List<StationVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public StationVO getById(String id) {
        RsbtStation entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(StationCreateDTO dto) {
        RsbtStation entity = new RsbtStation();
        entity.setGuid(UUID.randomUUID().toString());
        copyProperties(dto, entity);
        baseMapper.insert(entity);
    }

    public void update(String id, StationUpdateDTO dto) {
        RsbtStation entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        copyProperties(dto, entity);
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    public List<StationMapVO> getMapPoints() {
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNotNull(RsbtStation::getLongitude)
                .isNotNull(RsbtStation::getLatitude)
                .ne(RsbtStation::getLongitude, 0)
                .ne(RsbtStation::getLatitude, 0);
        List<RsbtStation> list = baseMapper.selectList(wrapper);
        return list.stream().map(this::convertToMapVO).collect(Collectors.toList());
    }

    public StationStatsVO getStats() {
        StationStatsVO vo = new StationStatsVO();
        Long total = baseMapper.selectCount(null);
        vo.setTotalCount(total);

        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(RsbtStation::getExpirationdate, LocalDate.now());
        vo.setValidCount(baseMapper.selectCount(wrapper));

        wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(RsbtStation::getExpirationdate, LocalDate.now());
        vo.setExpiredCount(baseMapper.selectCount(wrapper));

        wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtStation::getProvince).groupBy(RsbtStation::getProvince).last("ORDER BY COUNT(*) DESC LIMIT 1");
        RsbtStation topProvinceStation = baseMapper.selectOne(wrapper);
        vo.setTopProvince(topProvinceStation != null ? topProvinceStation.getProvince() : "");

        wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtStation::getStationtype).groupBy(RsbtStation::getStationtype).last("ORDER BY COUNT(*) DESC LIMIT 1");
        RsbtStation topTypeStation = baseMapper.selectOne(wrapper);
        vo.setTopType(topTypeStation != null ? topTypeStation.getStationtype() : "");

        return vo;
    }

    public List<RsbtStation> listAll() {
        return baseMapper.selectList(null);
    }

    public List<StationSelectVO> getSelectList() {
        List<RsbtStation> stations = baseMapper.selectList(
            new LambdaQueryWrapper<RsbtStation>()
                .select(RsbtStation::getGuid, RsbtStation::getSitename, RsbtStation::getStationtype,
                        RsbtStation::getType, RsbtStation::getProvince, RsbtStation::getUnit, RsbtStation::getLocation)
                .orderByAsc(RsbtStation::getSitename)
        );
        return stations.stream().map(this::convertToSelectVO).collect(Collectors.toList());
    }

    private StationSelectVO convertToSelectVO(RsbtStation entity) {
        StationSelectVO vo = new StationSelectVO();
        vo.setGuid(entity.getGuid());
        vo.setSitename(entity.getSitename());
        vo.setStationtype(entity.getStationtype());
        vo.setType(entity.getType());
        vo.setProvince(entity.getProvince());
        vo.setUnit(entity.getUnit());
        vo.setLocation(entity.getLocation());
        return vo;
    }

    public void importData(InputStream inputStream) {
        List<RsbtStation> importList = new ArrayList<>();
        com.alibaba.excel.EasyExcel.read(inputStream, RsbtStation.class, new com.alibaba.excel.read.listener.PageReadListener<RsbtStation>(list -> {
            for (RsbtStation item : list) {
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

    private void copyProperties(Object src, RsbtStation target) {
        if (src instanceof StationCreateDTO) {
            StationCreateDTO dto = (StationCreateDTO) src;
            target.setType(dto.getType());
            target.setTechnology(dto.getTechnology());
            target.setBbumodel(dto.getBbumodel());
            target.setOwnedsite(dto.getOwnedsite());
            target.setBackbone(dto.getBackbone());
            target.setStationpurpose(dto.getStationpurpose());
            target.setModulation(dto.getModulation());
            target.setStationtype(dto.getStationtype());
            target.setFrequencyt(dto.getFrequencyt());
            target.setFrequencyr(dto.getFrequencyr());
            target.setBandwidth(dto.getBandwidth());
            target.setBandwidthprocessingunitmodel(dto.getBandwidthprocessingunitmodel());
            target.setDevicemodel(dto.getDevicemodel());
            target.setDevicequantity(dto.getDevicequantity());
            target.setOutputpower(dto.getOutputpower());
            target.setAnttype(dto.getAnttype());
            target.setAntquantity(dto.getAntquantity());
            target.setProvince(dto.getProvince());
            target.setDistrict(dto.getDistrict());
            target.setLocation(dto.getLocation());
            target.setSitename(dto.getSitename());
            target.setUnit(dto.getUnit());
            target.setEquipname(dto.getEquipname());
            target.setLongitude(dto.getLongitude());
            target.setLatitude(dto.getLatitude());
            target.setStartdate(dto.getStartdate());
            target.setExpirationdate(dto.getExpirationdate());
            target.setFrequencyLicense(dto.getFrequencyLicense());
        } else if (src instanceof StationUpdateDTO) {
            StationUpdateDTO dto = (StationUpdateDTO) src;
            target.setType(dto.getType());
            target.setTechnology(dto.getTechnology());
            target.setBbumodel(dto.getBbumodel());
            target.setOwnedsite(dto.getOwnedsite());
            target.setBackbone(dto.getBackbone());
            target.setStationpurpose(dto.getStationpurpose());
            target.setModulation(dto.getModulation());
            target.setStationtype(dto.getStationtype());
            target.setFrequencyt(dto.getFrequencyt());
            target.setFrequencyr(dto.getFrequencyr());
            target.setBandwidth(dto.getBandwidth());
            target.setBandwidthprocessingunitmodel(dto.getBandwidthprocessingunitmodel());
            target.setDevicemodel(dto.getDevicemodel());
            target.setDevicequantity(dto.getDevicequantity());
            target.setOutputpower(dto.getOutputpower());
            target.setAnttype(dto.getAnttype());
            target.setAntquantity(dto.getAntquantity());
            target.setProvince(dto.getProvince());
            target.setDistrict(dto.getDistrict());
            target.setLocation(dto.getLocation());
            target.setSitename(dto.getSitename());
            target.setUnit(dto.getUnit());
            target.setEquipname(dto.getEquipname());
            target.setLongitude(dto.getLongitude());
            target.setLatitude(dto.getLatitude());
            target.setStartdate(dto.getStartdate());
            target.setExpirationdate(dto.getExpirationdate());
            target.setFrequencyLicense(dto.getFrequencyLicense());
        }
    }

    private StationVO convertToVO(RsbtStation entity) {
        StationVO vo = new StationVO();
        vo.setGuid(entity.getGuid());
        vo.setType(entity.getType());
        vo.setTechnology(entity.getTechnology());
        vo.setBbumodel(entity.getBbumodel());
        vo.setOwnedsite(entity.getOwnedsite());
        vo.setBackbone(entity.getBackbone());
        vo.setStationpurpose(entity.getStationpurpose());
        vo.setModulation(entity.getModulation());
        vo.setStationtype(entity.getStationtype());
        vo.setFrequencyt(entity.getFrequencyt());
        vo.setFrequencyr(entity.getFrequencyr());
        vo.setBandwidth(entity.getBandwidth());
        vo.setBandwidthprocessingunitmodel(entity.getBandwidthprocessingunitmodel());
        vo.setDevicemodel(entity.getDevicemodel());
        vo.setDevicequantity(entity.getDevicequantity());
        vo.setOutputpower(entity.getOutputpower());
        vo.setAnttype(entity.getAnttype());
        vo.setAntquantity(entity.getAntquantity());
        vo.setProvince(entity.getProvince());
        vo.setDistrict(entity.getDistrict());
        vo.setLocation(entity.getLocation());
        vo.setSitename(entity.getSitename());
        vo.setLongitude(entity.getLongitude());
        vo.setLatitude(entity.getLatitude());
        vo.setStartdate(entity.getStartdate());
        vo.setExpirationdate(entity.getExpirationdate());
        vo.setFrequencyLicense(entity.getFrequencyLicense());
        return vo;
    }

    private StationMapVO convertToMapVO(RsbtStation entity) {
        StationMapVO vo = new StationMapVO();
        vo.setGuid(entity.getGuid());
        vo.setSitename(entity.getSitename());
        vo.setLongitude(entity.getLongitude());
        vo.setLatitude(entity.getLatitude());
        vo.setType(entity.getType());
        vo.setStationtype(entity.getStationtype());
        vo.setProvince(entity.getProvince());

        // 频率字符串拼接：FREQUENCYT - FREQUENCYR MHz
        java.math.BigDecimal ft = entity.getFrequencyt();
        java.math.BigDecimal fr = entity.getFrequencyr();
        if (ft != null && fr != null) {
            vo.setFrequency(ft.stripTrailingZeros().toPlainString() + "–"
                          + fr.stripTrailingZeros().toPlainString() + " MHz");
            vo.setFreqMHz(ft.add(fr).divide(new java.math.BigDecimal("2"), 6, java.math.RoundingMode.HALF_UP));
        } else if (ft != null) {
            vo.setFrequency(ft.stripTrailingZeros().toPlainString() + " MHz");
            vo.setFreqMHz(ft);
        } else if (fr != null) {
            vo.setFrequency(fr.stripTrailingZeros().toPlainString() + " MHz");
            vo.setFreqMHz(fr);
        }

        // 设备型号 (复用 DEVICEMODEL)
        vo.setEquipModel(entity.getDevicemodel());

        // 设台单位 / 设备名称
        vo.setUnit(entity.getUnit());
        vo.setEquipName(entity.getEquipname());

        // 功率
        if (entity.getOutputpower() != null) {
            vo.setPower(entity.getOutputpower().stripTrailingZeros().toPlainString() + " W");
        }

        // 有效期
        if (entity.getExpirationdate() != null) {
            vo.setExpiry(entity.getExpirationdate().toString());
        }

        // 状态计算
        vo.setStatus(computeStatus(entity.getExpirationdate()));

        return vo;
    }

    private String computeStatus(java.time.LocalDate expirationDate) {
        if (expirationDate == null) return "normal";
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate warningThreshold = today.plusDays(90);
        if (expirationDate.isBefore(today)) return "expired";
        if (expirationDate.isBefore(warningThreshold)) return "expiring";
        return "normal";
    }
}