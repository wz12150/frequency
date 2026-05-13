package com.freqmanage.module.statistics.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import com.freqmanage.module.permit.mapper.SpecialPermitMapper;
import com.freqmanage.module.station.entity.RsbtStation;
import com.freqmanage.module.station.mapper.StationMapper;
import com.freqmanage.module.statistics.vo.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final StationMapper stationMapper;
    private final SpecialPermitMapper permitMapper;

    private static final long EXPIRING_DAYS = 60;

    // 台站类型颜色映射
    private static final Map<String, String> STATION_TYPE_COLORS = new LinkedHashMap<>();
    static {
        STATION_TYPE_COLORS.put("mobile", "#1976d2");
        STATION_TYPE_COLORS.put("broadcasting", "#42a5f5");
        STATION_TYPE_COLORS.put("fixed", "#64b5f6");
        STATION_TYPE_COLORS.put("satellite", "#90caf9");
        STATION_TYPE_COLORS.put("others", "#bbdefb");
    }

    // 省份名称映射
    private static final Map<String, String[]> PROVINCE_NAMES = new LinkedHashMap<>();
    static {
        PROVINCE_NAMES.put("ulaanbaatar", new String[]{"Ulaanbaatar", "UB"});
        PROVINCE_NAMES.put("tov", new String[]{"Töv", "TV"});
        PROVINCE_NAMES.put("selenge", new String[]{"Selenge", "SL"});
        PROVINCE_NAMES.put("dornogovi", new String[]{"Dornogovi", "DG"});
        PROVINCE_NAMES.put("khentii", new String[]{"Khentii", "KH"});
        PROVINCE_NAMES.put("khovsgol", new String[]{"Khövsgöl", "KS"});
        PROVINCE_NAMES.put("dornod", new String[]{"Dornod", "DN"});
        PROVINCE_NAMES.put("arkhangai", new String[]{"Arkhangai", "AK"});
        PROVINCE_NAMES.put("bulgan", new String[]{"Bulgan", "BL"});
        PROVINCE_NAMES.put("ovorkhangai", new String[]{"Övörkhangai", "OK"});
        PROVINCE_NAMES.put("sukhbaatar", new String[]{"Sükhbaatar", "SB"});
        PROVINCE_NAMES.put("zavkhan", new String[]{"Zavkhan", "ZV"});
        PROVINCE_NAMES.put("khovd", new String[]{"Khovd", "KV"});
        PROVINCE_NAMES.put("omnogovi", new String[]{"Ömnögovi", "OM"});
        PROVINCE_NAMES.put("bayankhongor", new String[]{"Bayankhongor", "BK"});
        PROVINCE_NAMES.put("uvs", new String[]{"Uvs", "UV"});
        PROVINCE_NAMES.put("dundgovi", new String[]{"Dundgovi", "DD"});
        PROVINCE_NAMES.put("bayan-olgii", new String[]{"Bayan-Ölgii", "BO"});
        PROVINCE_NAMES.put("govi-altai", new String[]{"Govi-Altai", "GA"});
        PROVINCE_NAMES.put("darkhan-uul", new String[]{"Darkhan-Uul", "DU"});
        PROVINCE_NAMES.put("orkhon", new String[]{"Orkhon", "OR"});
        PROVINCE_NAMES.put("govisumber", new String[]{"Govisümber", "GS"});
    }

    public DashboardService(StationMapper stationMapper, SpecialPermitMapper permitMapper) {
        this.stationMapper = stationMapper;
        this.permitMapper = permitMapper;
    }

    public DashboardOverviewVO getOverview() {
        DashboardOverviewVO vo = new DashboardOverviewVO();

        LocalDate now = LocalDate.now();
        LocalDate expiringThreshold = now.plusDays(EXPIRING_DAYS);

        // ── KPI: 台站总数 ─────────────────────────────────────────────────
        Long totalStations = stationMapper.selectCount(null);
        vo.setTotalStations(totalStations);

        // ── KPI: 许可证统计 ───────────────────────────────────────────────
        Long totalPermits = permitMapper.selectCount(null);

        LambdaQueryWrapper<RsbtSpecialPermit> validWrapper = new LambdaQueryWrapper<>();
        validWrapper.ge(RsbtSpecialPermit::getEnddate, now);
        Long validPermits = permitMapper.selectCount(validWrapper);

        LambdaQueryWrapper<RsbtSpecialPermit> expiringWrapper = new LambdaQueryWrapper<>();
        expiringWrapper.gt(RsbtSpecialPermit::getEnddate, now).le(RsbtSpecialPermit::getEnddate, expiringThreshold);
        Long expiringPermits = permitMapper.selectCount(expiringWrapper);

        LambdaQueryWrapper<RsbtSpecialPermit> expiredWrapper = new LambdaQueryWrapper<>();
        expiredWrapper.lt(RsbtSpecialPermit::getEnddate, now);
        Long expiredPermits = permitMapper.selectCount(expiredWrapper);

        Long normalPermits = totalPermits - validPermits - expiringPermits - expiredPermits;
        if (normalPermits < 0) normalPermits = 0L;

        vo.setNormalLicenses(normalPermits);
        vo.setExpiringSoon(expiringPermits);
        vo.setExpired(expiredPermits);

        // ── 增长率 ───────────────────────────────────────────────────────
        // 计算月度环比增长率
        LocalDate lastMonthStart = now.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = lastMonthStart.withDayOfMonth(lastMonthStart.lengthOfMonth());

        LambdaQueryWrapper<RsbtStation> stationWrapper = new LambdaQueryWrapper<>();
        List<RsbtStation> allStations = stationMapper.selectList(stationWrapper);

        long thisMonthCount = allStations.stream()
                .filter(s -> s.getCreateTime() != null)
                .filter(s -> {
                    LocalDate d = s.getCreateTime().toLocalDate();
                    return d.getMonth() == now.getMonth() && d.getYear() == now.getYear();
                })
                .count();

        long lastMonthCount = allStations.stream()
                .filter(s -> s.getCreateTime() != null)
                .filter(s -> {
                    LocalDate d = s.getCreateTime().toLocalDate();
                    return d.getMonth() == lastMonthStart.getMonth() && d.getYear() == lastMonthStart.getYear();
                })
                .count();

        String stationGrowthStr = calcGrowthRate(thisMonthCount, lastMonthCount);

        // 许可证增长率计算同理
        long thisMonthPermits = permitMapper.selectCount(new LambdaQueryWrapper<RsbtSpecialPermit>()
                .ge(RsbtSpecialPermit::getCreateTime, now.withDayOfMonth(1)));
        long lastMonthPermits = permitMapper.selectCount(new LambdaQueryWrapper<RsbtSpecialPermit>()
                .ge(RsbtSpecialPermit::getCreateTime, lastMonthStart)
                .lt(RsbtSpecialPermit::getCreateTime, now.withDayOfMonth(1)));

        String licenseGrowthStr = calcGrowthRate(validPermits, lastMonthCount > 0 ? lastMonthCount : 1);

        vo.setStationGrowth(stationGrowthStr);
        vo.setLicenseGrowth(licenseGrowthStr);
        vo.setExpiringGrowth("+0.0%");
        vo.setExpiredGrowth("-0.0%");

        // ── 省份台站统计 ──────────────────────────────────────────────────
        vo.setProvinceStats(buildProvinceStats(allStations, expiringThreshold));

        // ── 许可证类型统计（按type分组）───────────────────────────────────
        vo.setLicenseTypeStats(buildLicenseTypeStats());

        // ── 台站类型分布 ─────────────────────────────────────────────────
        vo.setStationTypes(buildStationTypes());

        // ── 台站增长趋势 ──────────────────────────────────────────────────
        vo.setStationGrowthTrend(buildStationGrowthTrend());

        return vo;
    }

    private List<ProvinceStationVO> buildProvinceStats(List<RsbtStation> allStations, LocalDate expiringThreshold) {
        Map<String, Long> provinceTotal = new HashMap<>();
        Map<String, Long> provinceExpiring = new HashMap<>();
        Map<String, Long> provinceExpired = new HashMap<>();

        for (RsbtStation s : allStations) {
            String province = s.getProvince();
            if (province == null || province.isEmpty()) continue;

            provinceTotal.merge(province, 1L, Long::sum);

            if (s.getExpirationdate() != null) {
                LocalDate expDate = s.getExpirationdate();
                if (expDate.isBefore(LocalDate.now())) {
                    provinceExpired.merge(province, 1L, Long::sum);
                } else if (!expDate.isAfter(expiringThreshold)) {
                    provinceExpiring.merge(province, 1L, Long::sum);
                }
            }
        }

        List<ProvinceStationVO> result = new ArrayList<>();
        for (Map.Entry<String, String[]> entry : PROVINCE_NAMES.entrySet()) {
            String id = entry.getKey();
            String name = entry.getValue()[0];
            String abbr = entry.getValue()[1];
            Long total = provinceTotal.getOrDefault(id, 0L);
            Long expiring = provinceExpiring.getOrDefault(id, 0L);
            Long expired = provinceExpired.getOrDefault(id, 0L);

            ProvinceStationVO pvo = new ProvinceStationVO();
            pvo.setId(id);
            pvo.setName(name);
            pvo.setAbbr(abbr);
            pvo.setTotal(total);
            pvo.setExpiring60(expiring);
            pvo.setExpired(expired);
            result.add(pvo);
        }
        return result;
    }

    private List<LicenseTypeStatsVO> buildLicenseTypeStats() {
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        List<RsbtSpecialPermit> permits = permitMapper.selectList(wrapper);

        LocalDate now = LocalDate.now();
        LocalDate expiringThreshold = now.plusDays(EXPIRING_DAYS);

        Map<String, Long> normalCounts = new HashMap<>();
        Map<String, Long> expiringCounts = new HashMap<>();
        Map<String, Long> expiredCounts = new HashMap<>();

        for (RsbtSpecialPermit p : permits) {
            String type = p.getType() != null ? p.getType() : "Unknown";
            if (p.getEnddate() == null) {
                normalCounts.merge(type, 1L, Long::sum);
            } else if (p.getEnddate().isBefore(now)) {
                expiredCounts.merge(type, 1L, Long::sum);
            } else if (!p.getEnddate().isAfter(expiringThreshold)) {
                expiringCounts.merge(type, 1L, Long::sum);
            } else {
                normalCounts.merge(type, 1L, Long::sum);
            }
        }

        // 按许可证类型排序输出
        List<LicenseTypeStatsVO> result = new ArrayList<>();
        Set<String> types = new LinkedHashSet<>();
        types.addAll(normalCounts.keySet());
        types.addAll(expiringCounts.keySet());
        types.addAll(expiredCounts.keySet());

        for (String type : types) {
            LicenseTypeStatsVO lvo = new LicenseTypeStatsVO();
            lvo.setId(type.toLowerCase().replace(" ", "-"));
            lvo.setType(type);
            lvo.setNormal(normalCounts.getOrDefault(type, 0L));
            lvo.setExpiring(expiringCounts.getOrDefault(type, 0L));
            lvo.setExpired(expiredCounts.getOrDefault(type, 0L));
            result.add(lvo);
        }
        return result;
    }

    private List<StationTypeVO> buildStationTypes() {
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtStation::getStationtype);
        List<RsbtStation> stations = stationMapper.selectList(wrapper);

        Map<String, Long> typeCounts = stations.stream()
                .filter(s -> s.getStationtype() != null && !s.getStationtype().isEmpty())
                .collect(Collectors.groupingBy(RsbtStation::getStationtype, Collectors.counting()));

        List<StationTypeVO> result = new ArrayList<>();
        int idx = 0;
        for (Map.Entry<String, Long> entry : typeCounts.entrySet()) {
            StationTypeVO svo = new StationTypeVO();
            svo.setId(entry.getKey().toLowerCase().replace(" ", "-"));
            svo.setName(entry.getKey());
            svo.setValue(entry.getValue());
            String color = STATION_TYPE_COLORS.values().stream()
                    .skip(idx % STATION_TYPE_COLORS.size())
                    .findFirst()
                    .orElse("#1976d2");
            svo.setColor(color);
            result.add(svo);
            idx++;
        }
        return result;
    }

    private List<StationGrowthVO> buildStationGrowthTrend() {
        LambdaQueryWrapper<RsbtStation> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(RsbtStation::getCreateTime);
        List<RsbtStation> stations = stationMapper.selectList(wrapper);

        Map<String, Long> monthlyCounts = new HashMap<>();
        for (RsbtStation s : stations) {
            if (s.getCreateTime() != null) {
                String month = s.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                monthlyCounts.merge(month, 1L, Long::sum);
            }
        }

        // 最近12个月
        LocalDate now = LocalDate.now();
        List<StationGrowthVO> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String monthStr = month.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            StationGrowthVO vo = new StationGrowthVO();
            vo.setMonth(monthStr);
            vo.setCount(monthlyCounts.getOrDefault(monthStr, 0L));
            result.add(vo);
        }
        return result;
    }

    private String calcGrowthRate(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? "+100.0%" : "+0.0%";
        }
        double rate = ((double) (current - previous) / previous) * 100;
        String sign = rate >= 0 ? "+" : "";
        return sign + String.format("%.1f", rate) + "%";
    }
}