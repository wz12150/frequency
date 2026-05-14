package com.freqmanage.module.statistics.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import com.freqmanage.module.permit.entity.RsbtSpecialPermitStation;
import com.freqmanage.module.permit.mapper.SpecialPermitFrequencyMapper;
import com.freqmanage.module.permit.mapper.SpecialPermitMapper;
import com.freqmanage.module.permit.mapper.SpecialPermitStationMapper;
import com.freqmanage.module.station.entity.RsbtStation;
import com.freqmanage.module.station.mapper.StationMapper;
import com.freqmanage.module.statistics.vo.LicenseCountByTypeVO;
import com.freqmanage.module.statistics.vo.MonthlyGrowthVO;
import com.freqmanage.module.statistics.vo.PermitUsageByMonthVO;
import com.freqmanage.module.statistics.vo.PermitUsageGrowthVO;
import com.freqmanage.module.statistics.vo.ProvinceStationVO;
import com.freqmanage.module.statistics.vo.StationGrowthVO;
import com.freqmanage.module.statistics.vo.StationRegionDetailVO;
import com.freqmanage.module.statistics.vo.ExpiredStationVO;
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

    public List<MonthlyGrowthVO> getGrowthTrend(String type, Integer year, String province) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<MonthlyGrowthVO> result = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            // 当年当月计数
            Long current = countStations(targetYear, month, type, province);
            // 去年同月计数
            Long previous = countStations(targetYear - 1, month, type, province);
            // 上月计数（用于环比）
            Long lastMonth = month > 1 ? countStations(targetYear, month - 1, type, province) : 0L;

            long growthCountVal = current - previous;
            double growthPercentVal = previous > 0 ? (growthCountVal * 100.0 / previous) : 0.0;
            long momCountVal = current - lastMonth;
            double momPercentVal = lastMonth > 0 ? (momCountVal * 100.0 / lastMonth) : 0.0;

            MonthlyGrowthVO vo = new MonthlyGrowthVO();
            vo.setMonth(new java.text.SimpleDateFormat("MMM", java.util.Locale.ENGLISH)
                            .format(new java.util.Date(targetYear - 1900, month - 1, 1)));
            vo.setCurrent(current);
            vo.setPrevious(previous);
            vo.setGrowthCount(growthCountVal);
            vo.setGrowthPercent(Math.round(growthPercentVal * 10) / 10.0);
            vo.setMomCount(momCountVal);
            vo.setMomPercent(Math.round(momPercentVal * 10) / 10.0);
            result.add(vo);
        }
        return result;
    }

    private Long countStations(Integer year, Integer month, String type, String province) {
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        if (year != null && month != null) {
            wrapper.apply("YEAR(startdate) = {0} AND MONTH(startdate) = {1}", year, month);
        }
        if (!"All".equals(type) && type != null && !type.isEmpty()) {
            wrapper.eq(RsbtStation::getStationtype, type);
        }
        if (!"All".equals(province) && province != null && !province.isEmpty()) {
            wrapper.eq(RsbtStation::getProvince, province);
        }
        return stationMapper.selectCount(wrapper);
    }

    public List<ExpiredStationVO> getExpiredStations(Integer year, String province, String type) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtStation::getDeleted, 0);

        if (!"All".equals(province) && province != null && !province.isEmpty()) {
            wrapper.eq(RsbtStation::getProvince, province);
        }
        if (!"All".equals(type) && type != null && !type.isEmpty()) {
            wrapper.eq(RsbtStation::getStationtype, type);
        }

        List<RsbtStation> stations = stationMapper.selectList(wrapper);

        LocalDate now = LocalDate.now();
        LocalDate threeMonthsLater = now.plusMonths(3);

        return stations.stream()
                .filter(s -> s.getExpirationdate() != null
                        && s.getExpirationdate().getYear() == targetYear)
                .filter(s -> s.getExpirationdate().isBefore(now)
                        || s.getExpirationdate().isBefore(threeMonthsLater))
                .map(this::convertToExpiredVO)
                .sorted(Comparator.comparing(ExpiredStationVO::getMonth))
                .collect(Collectors.toList());
    }

    private ExpiredStationVO convertToExpiredVO(RsbtStation s) {
        ExpiredStationVO vo = new ExpiredStationVO();
        vo.setGuid(s.getGuid());
        vo.setName(s.getSitename());
        vo.setProvince(s.getProvince());
        vo.setType(s.getStationtype());
        vo.setExpiredCount(1);
        vo.setExpireDate(s.getExpirationdate() != null ? s.getExpirationdate().toString() : "");
        vo.setTechnicalStandard(s.getTechnology());
        vo.setBandwidthProcessingUnitModel(s.getBbumodel());
        vo.setOwnerName(s.getUnit());
        vo.setBackhaulNetworkAccessMethod(s.getBackbone());
        vo.setStationPurpose(s.getStationpurpose());
        vo.setModulationType(s.getModulation());
        vo.setStationType(s.getStationtype());
        if (s.getFrequencyt() != null) {
            vo.setTransmitFrequency(s.getFrequencyt().stripTrailingZeros().toPlainString() + " MHz");
        }
        if (s.getFrequencyr() != null) {
            vo.setReceiveFrequency(s.getFrequencyr().stripTrailingZeros().toPlainString() + " MHz");
        }
        if (s.getBandwidth() != null) {
            vo.setBandwidth(s.getBandwidth().stripTrailingZeros().toPlainString() + " MHz");
        }
        vo.setEquipmentNameAndModel(s.getDevicemodel());
        if (s.getDevicequantity() != null) {
            vo.setEquipmentCount(String.valueOf(s.getDevicequantity()));
        }
        if (s.getOutputpower() != null) {
            vo.setEquipmentPower(s.getOutputpower().stripTrailingZeros().toPlainString() + " W");
        }
        vo.setAntennaType(s.getAnttype());
        if (s.getAntquantity() != null) {
            vo.setAntennaCount(String.valueOf(s.getAntquantity()));
        }
        vo.setRegion(s.getProvince());
        vo.setDetailedLocation(s.getLocation());
        if (s.getLongitude() != null) {
            vo.setLongitude(s.getLongitude().stripTrailingZeros().toPlainString());
        }
        if (s.getLatitude() != null) {
            vo.setLatitude(s.getLatitude().stripTrailingZeros().toPlainString());
        }
        vo.setOpenDate(s.getStartdate() != null ? s.getStartdate().toString() : "");
        if (s.getExpirationdate() != null) {
            vo.setMonth(s.getExpirationdate().getMonthValue());
        }
        return vo;
    }

    public List<PermitUsageByMonthVO> getPermitUsageByMonth(String businessType, String province, Integer year) {
        List<PermitUsageByMonthVO> result = new ArrayList<>();
        int targetYear = year != null ? year : LocalDate.now().getYear();

        // Fetch all permits for target year and previous year in bulk to avoid N+1 queries
        // 2 queries instead of 48+
        List<RsbtSpecialPermit> currentYearPermits = fetchPermitsByYear(targetYear, businessType, province);
        List<RsbtSpecialPermit> prevYearPermits = fetchPermitsByYear(targetYear - 1, businessType, province);

        LocalDate now = LocalDate.now();

        for (int month = 1; month <= 12; month++) {
            // Count current month active and total from cached data
            long activeCount = currentYearPermits.stream()
                    .filter(p -> p.getStartdate() != null
                            && p.getStartdate().getYear() == targetYear
                            && p.getStartdate().getMonthValue() == month
                            && p.getEnddate() != null && p.getEnddate().isAfter(now))
                    .count();
            long totalCount = currentYearPermits.stream()
                    .filter(p -> p.getStartdate() != null
                            && p.getStartdate().getYear() == targetYear
                            && p.getStartdate().getMonthValue() == month)
                    .count();

            // Count previous year same month
            long prevYearActive = prevYearPermits.stream()
                    .filter(p -> p.getStartdate() != null
                            && p.getStartdate().getYear() == targetYear - 1
                            && p.getStartdate().getMonthValue() == month
                            && p.getEnddate() != null && p.getEnddate().isAfter(now))
                    .count();
            long prevYearTotal = prevYearPermits.stream()
                    .filter(p -> p.getStartdate() != null
                            && p.getStartdate().getYear() == targetYear - 1
                            && p.getStartdate().getMonthValue() == month)
                    .count();

            // Count previous month
            long prevMonthActive = 0;
            long prevMonthTotal = 0;
            if (month > 1) {
                prevMonthActive = currentYearPermits.stream()
                        .filter(p -> p.getStartdate() != null
                                && p.getStartdate().getYear() == targetYear
                                && p.getStartdate().getMonthValue() == month - 1
                                && p.getEnddate() != null && p.getEnddate().isAfter(now))
                        .count();
                prevMonthTotal = currentYearPermits.stream()
                        .filter(p -> p.getStartdate() != null
                                && p.getStartdate().getYear() == targetYear
                                && p.getStartdate().getMonthValue() == month - 1)
                        .count();
            }

            double usageRate = totalCount > 0 ? (activeCount * 100.0 / totalCount) : 0.0;
            double prevYearRate = prevYearTotal > 0 ? (prevYearActive * 100.0 / prevYearTotal) : 0.0;
            double prevMonthRateVal = prevMonthTotal > 0 ? (prevMonthActive * 100.0 / prevMonthTotal) : 0.0;

            double yoyGrowth = prevYearRate > 0 ? usageRate - prevYearRate : 0.0;
            double momGrowth = month > 1 && prevMonthRateVal > 0 ? usageRate - prevMonthRateVal : 0.0;

            PermitUsageByMonthVO vo = new PermitUsageByMonthVO();
            vo.setMonth(String.format("%02d", month));
            vo.setBusinessType(businessType != null ? businessType : "All");
            vo.setProvince(province != null ? province : "All");
            vo.setYear(String.valueOf(targetYear));
            vo.setUsageRate(Math.round(usageRate * 10) / 10.0);
            vo.setYoyGrowth(Math.round(yoyGrowth * 10) / 10.0);
            vo.setMomGrowth(Math.round(momGrowth * 10) / 10.0);
            vo.setPrevYearRate(Math.round(prevYearRate * 10) / 10.0);
            vo.setPrevMonthRate(month > 1 ? Math.round(prevMonthRateVal * 10) / 10.0 : 0.0);
            vo.setTotalCount(totalCount);
            vo.setActiveCount(activeCount);
            result.add(vo);
        }
        return result;
    }

    private List<RsbtSpecialPermit> fetchPermitsByYear(Integer year, String businessType, String province) {
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        if (year != null) {
            wrapper.apply("YEAR(startdate) = {0}", year);
        }
        if (!"All".equals(businessType) && businessType != null && !businessType.isEmpty()) {
            wrapper.eq(RsbtSpecialPermit::getCategory, businessType);
        }
        if (!"All".equals(province) && province != null && !province.isEmpty()) {
            wrapper.like(RsbtSpecialPermit::getScope, province);
        }
        return permitMapper.selectList(wrapper);
    }

    public List<LicenseCountByTypeVO> getLicenseCountByType(String province, String date) {
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtSpecialPermit::getCategory, RsbtSpecialPermit::getProvince);
        if (!"All".equals(province) && province != null && !province.isEmpty()) {
            wrapper.eq(RsbtSpecialPermit::getProvince, province);
        }
        if (date != null && !date.isEmpty()) {
            wrapper.apply("DATE(startdate) <= {0}", date);
        }
        List<RsbtSpecialPermit> permits = permitMapper.selectList(wrapper);

        return permits.stream()
                .filter(p -> p.getCategory() != null && !p.getCategory().isEmpty())
                .collect(Collectors.groupingBy(p -> p.getCategory() + "|" + nvl(p.getProvince(), "Unknown")))
                .entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|");
                    LicenseCountByTypeVO vo = new LicenseCountByTypeVO();
                    vo.setType(parts[0]);
                    vo.setProvince(parts[1]);
                    vo.setCount((long) entry.getValue().size());
                    vo.setDate(date != null ? date : LocalDate.now().toString());
                    vo.setPeriod("day");
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private String nvl(String val, String defaultVal) {
        return val != null && !val.isEmpty() ? val : defaultVal;
    }
}