package com.freqmanage.module.statistics.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitStation;
import com.freqmanage.module.permit.mapper.SpecialPermitFrequencyMapper;
import com.freqmanage.module.permit.mapper.SpecialPermitMapper;
import com.freqmanage.module.permit.mapper.SpecialPermitStationMapper;
import com.freqmanage.module.station.entity.RsbtStation;
import com.freqmanage.module.station.mapper.StationMapper;
import com.freqmanage.module.statistics.vo.PermitUsageGrowthVO;
import com.freqmanage.module.statistics.vo.ProvinceStationVO;
import com.freqmanage.module.statistics.vo.StationGrowthVO;
import com.freqmanage.module.statistics.vo.StationRegionDetailVO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {
    private final StationMapper stationMapper;
    private final SpecialPermitMapper permitMapper;
    private final SpecialPermitFrequencyMapper frequencyMapper;
    private final SpecialPermitStationMapper stationPermitMapper;

    public StatisticsService(StationMapper stationMapper, SpecialPermitMapper permitMapper,
                            SpecialPermitFrequencyMapper frequencyMapper, SpecialPermitStationMapper stationPermitMapper) {
        this.stationMapper = stationMapper;
        this.permitMapper = permitMapper;
        this.frequencyMapper = frequencyMapper;
        this.stationPermitMapper = stationPermitMapper;
    }

    public List<ProvinceStationVO> getStationRegionStats() {
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtStation::getProvince, RsbtStation::getStationtype);
        List<RsbtStation> stations = stationMapper.selectList(wrapper);

        Map<String, List<RsbtStation>> byProvince = stations.stream()
                .filter(s -> s.getProvince() != null && !s.getProvince().isEmpty())
                .collect(Collectors.groupingBy(RsbtStation::getProvince));

        return byProvince.entrySet().stream().map(entry -> {
            ProvinceStationVO vo = new ProvinceStationVO();
            vo.setProvince(entry.getKey());
            vo.setCount((long) entry.getValue().size());
            Map<String, Long> typeDist = entry.getValue().stream()
                    .filter(s -> s.getStationtype() != null && !s.getStationtype().isEmpty())
                    .collect(Collectors.groupingBy(RsbtStation::getStationtype, Collectors.counting()));
            vo.setTypeDistribution(typeDist);
            return vo;
        }).collect(Collectors.toList());
    }

    public StationGrowthVO getStationGrowth() {
        StationGrowthVO vo = new StationGrowthVO();
        LocalDate now = LocalDate.now();
        Map<String, Long> monthlyData = new LinkedHashMap<>();

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            String key = ym.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
            wrapper.le(RsbtStation::getStartdate, ym.atEndOfMonth());
            Long count = stationMapper.selectCount(wrapper);
            monthlyData.put(key, count);
        }

        vo.setMonthlyData(monthlyData);

        if (monthlyData.size() >= 2) {
            List<Long> values = new ArrayList<>(monthlyData.values());
            Long last = values.get(values.size() - 1);
            Long prev = values.get(values.size() - 2);
            if (prev > 0) {
                vo.setGrowthRate((last - prev) * 100.0 / prev);
            } else {
                vo.setGrowthRate(0.0);
            }
        } else {
            vo.setGrowthRate(0.0);
        }

        return vo;
    }

    public Map<String, Long> getExpiredStationStats() {
        LambdaQueryWrapper<RsbtStation> expiredWrapper = new LambdaQueryWrapper<>();
        expiredWrapper.lt(RsbtStation::getExpirationdate, LocalDate.now());
        List<RsbtStation> expiredStations = stationMapper.selectList(expiredWrapper);

        return expiredStations.stream()
                .filter(s -> s.getProvince() != null && !s.getProvince().isEmpty())
                .collect(Collectors.groupingBy(RsbtStation::getProvince, Collectors.counting()));
    }

    public Map<String, Long> getValidStationStats() {
        LambdaQueryWrapper<RsbtStation> validWrapper = new LambdaQueryWrapper<>();
        validWrapper.ge(RsbtStation::getExpirationdate, LocalDate.now());
        List<RsbtStation> validStations = stationMapper.selectList(validWrapper);

        return validStations.stream()
                .filter(s -> s.getProvince() != null && !s.getProvince().isEmpty())
                .collect(Collectors.groupingBy(RsbtStation::getProvince, Collectors.counting()));
    }

    public PermitUsageGrowthVO getPermitUsageGrowth() {
        PermitUsageGrowthVO vo = new PermitUsageGrowthVO();
        LocalDate now = LocalDate.now();
        Map<String, Long> monthlyData = new LinkedHashMap<>();

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            String key = ym.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
            wrapper.le(RsbtSpecialPermit::getStartdate, ym.atEndOfMonth());
            Long count = permitMapper.selectCount(wrapper);
            monthlyData.put(key, count);
        }

        vo.setMonthlyData(monthlyData);

        if (monthlyData.size() >= 2) {
            List<Long> values = new ArrayList<>(monthlyData.values());
            Long last = values.get(values.size() - 1);
            Long prev = values.get(values.size() - 2);
            if (prev > 0) {
                vo.setGrowthRate((last - prev) * 100.0 / prev);
            } else {
                vo.setGrowthRate(0.0);
            }
        } else {
            vo.setGrowthRate(0.0);
        }

        return vo;
    }

    public Map<String, Long> getPermitCountByStatus() {
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtSpecialPermit::getStatus);
        List<RsbtSpecialPermit> permits = permitMapper.selectList(wrapper);
        return permits.stream()
                .filter(p -> p.getStatus() != null && !p.getStatus().isEmpty())
                .collect(Collectors.groupingBy(RsbtSpecialPermit::getStatus, Collectors.counting()));
    }

    public Map<String, Long> getPermitStationCount() {
        LambdaQueryWrapper<RsbtSpecialPermitStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtSpecialPermitStation::getType);
        List<RsbtSpecialPermitStation> stations = stationPermitMapper.selectList(wrapper);
        return stations.stream()
                .filter(s -> s.getType() != null && !s.getType().isEmpty())
                .collect(Collectors.groupingBy(RsbtSpecialPermitStation::getType, Collectors.counting()));
    }

    public Map<String, Long> getPermitExpiryStats() {
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtSpecialPermit::getEnddate);
        List<RsbtSpecialPermit> permits = permitMapper.selectList(wrapper);

        LocalDate now = LocalDate.now();
        LocalDate threeMonthsLater = now.plusMonths(3);

        Map<String, Long> stats = new HashMap<>();
        stats.put("expired", permits.stream().filter(p -> p.getEnddate() != null && p.getEnddate().isBefore(now)).count());
        stats.put("expiringSoon", permits.stream().filter(p -> p.getEnddate() != null && !p.getEnddate().isBefore(now) && p.getEnddate().isBefore(threeMonthsLater)).count());
        stats.put("valid", permits.stream().filter(p -> p.getEnddate() != null && !p.getEnddate().isBefore(threeMonthsLater)).count());

        return stats;
    }

    public List<StationRegionDetailVO> getRegionStats() {
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtStation::getProvince, RsbtStation::getStationtype);
        List<RsbtStation> stations = stationMapper.selectList(wrapper);

        // 按 province 分组
        Map<String, List<RsbtStation>> byProvince = stations.stream()
                .filter(s -> s.getProvince() != null && !s.getProvince().isEmpty())
                .collect(Collectors.groupingBy(RsbtStation::getProvince));

        return byProvince.entrySet().stream()
                .map(entry -> {
                    Map<String, Long> typeCountMap = entry.getValue().stream()
                            .filter(s -> s.getStationtype() != null && !s.getStationtype().isEmpty())
                            .collect(Collectors.groupingBy(
                                    s -> s.getStationtype(),
                                    Collectors.counting()));
                    return StationRegionDetailVO.from(entry.getKey(), typeCountMap);
                })
                .sorted(Comparator.comparingLong(StationRegionDetailVO::getTotal).reversed())
                .collect(Collectors.toList());
    }
}