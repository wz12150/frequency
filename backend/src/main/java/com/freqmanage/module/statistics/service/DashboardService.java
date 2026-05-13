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

    private static final Map<String, String> STATION_TYPE_COLORS = new LinkedHashMap<>();
    static {
        STATION_TYPE_COLORS.put("mobile", "#1976d2");
        STATION_TYPE_COLORS.put("broadcasting", "#42a5f5");
        STATION_TYPE_COLORS.put("fixed", "#64b5f6");
        STATION_TYPE_COLORS.put("satellite", "#90caf9");
        STATION_TYPE_COLORS.put("others", "#bbdefb");
    }

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

    // 数据库省份名 → PROVINCE_NAMES key 的映射
    private static final Map<String, String> DB_PROVINCE_TO_KEY = new LinkedHashMap<>();
    static {
        DB_PROVINCE_TO_KEY.put("Ulaanbaatar", "ulaanbaatar");
        DB_PROVINCE_TO_KEY.put("Darkhan", "darkhan-uul");
        DB_PROVINCE_TO_KEY.put("Erdenet", "orkhon");
        DB_PROVINCE_TO_KEY.put("Morsy", "khovsgol");
        DB_PROVINCE_TO_KEY.put("Ulgii", "bayan-olgii");
        DB_PROVINCE_TO_KEY.put("Arvayheer", "ovorkhangai");
    }

    public DashboardService(StationMapper stationMapper, SpecialPermitMapper permitMapper) {
        this.stationMapper = stationMapper;
        this.permitMapper = permitMapper;
    }

    public DashboardOverviewVO getOverview() {
        DashboardOverviewVO vo = new DashboardOverviewVO();
        LocalDate now = LocalDate.now();
        LocalDate expiringThreshold = now.plusDays(EXPIRING_DAYS);

        vo.setTotalStations(stationMapper.selectCount(null));
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
        vo.setStationGrowth(calcGrowthRate(countThisMonthStations(now), countLastMonthStations(now)));
        vo.setLicenseGrowth(calcGrowthRate(countThisMonthPermits(now), countLastMonthPermits(now)));
        vo.setExpiringGrowth("+0.0%");
        vo.setExpiredGrowth("-0.0%");
        vo.setProvinceStats(buildProvinceStats());
        vo.setLicenseTypeStats(buildLicenseTypeStats());
        vo.setStationTypes(buildStationTypes());
        vo.setStationGrowthTrend(buildStationGrowthTrend());
        return vo;
    }

    public Map<String, Long> getStationTypeDistribution() {
        return buildStationTypes().stream().collect(Collectors.toMap(StationTypeVO::getName, StationTypeVO::getValue, (a, b) -> a, LinkedHashMap::new));
    }

    public Map<String, Long> getPermitStatusDistribution() {
        LambdaQueryWrapper<RsbtSpecialPermit> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(RsbtSpecialPermit::getStatus);
        return permitMapper.selectList(wrapper).stream()
                .filter(p -> p.getStatus() != null && !p.getStatus().isEmpty())
                .collect(Collectors.groupingBy(RsbtSpecialPermit::getStatus, LinkedHashMap::new, Collectors.counting()));
    }

    public Map<String, Long> getProvinceStationCount() {
        return buildProvinceStats().stream().collect(Collectors.toMap(ProvinceStationVO::getName, ProvinceStationVO::getTotal, (a, b) -> a, LinkedHashMap::new));
    }

    public StationGrowthVO getStationGrowth() {
        List<StationGrowthVO> trend = buildStationGrowthTrend();
        StationGrowthVO vo = new StationGrowthVO();
        if (!trend.isEmpty()) {
            vo.setMonth(trend.get(trend.size() - 1).getMonth());
            vo.setCount(trend.get(trend.size() - 1).getCount());
        }
        Map<String, Long> monthlyData = trend.stream().collect(Collectors.toMap(StationGrowthVO::getMonth, StationGrowthVO::getCount, (a, b) -> a, LinkedHashMap::new));
        vo.setMonthlyData(monthlyData);
        if (monthlyData.size() >= 2) {
            List<Long> values = new ArrayList<>(monthlyData.values());
            long last = values.get(values.size() - 1);
            long prev = values.get(values.size() - 2);
            vo.setGrowthRate(prev > 0 ? (last - prev) * 100.0 / prev : 0.0);
        } else {
            vo.setGrowthRate(0.0);
        }
        return vo;
    }

    private long countThisMonthStations(LocalDate now) { return stationMapper.selectCount(new LambdaQueryWrapper<RsbtStation>().ge(RsbtStation::getCreateTime, now.withDayOfMonth(1))); }
    private long countLastMonthStations(LocalDate now) { LocalDate lastMonthStart = now.minusMonths(1).withDayOfMonth(1); return stationMapper.selectCount(new LambdaQueryWrapper<RsbtStation>().ge(RsbtStation::getCreateTime, lastMonthStart).lt(RsbtStation::getCreateTime, now.withDayOfMonth(1))); }
    private long countThisMonthPermits(LocalDate now) { return permitMapper.selectCount(new LambdaQueryWrapper<RsbtSpecialPermit>().ge(RsbtSpecialPermit::getCreateTime, now.withDayOfMonth(1))); }
    private long countLastMonthPermits(LocalDate now) { LocalDate lastMonthStart = now.minusMonths(1).withDayOfMonth(1); return permitMapper.selectCount(new LambdaQueryWrapper<RsbtSpecialPermit>().ge(RsbtSpecialPermit::getCreateTime, lastMonthStart).lt(RsbtSpecialPermit::getCreateTime, now.withDayOfMonth(1))); }

    private List<ProvinceStationVO> buildProvinceStats() {
        List<RsbtStation> allStations = stationMapper.selectList(new LambdaQueryWrapper<>());
        Map<String, Long> provinceTotal = new HashMap<>();
        Map<String, Long> provinceExpiring = new HashMap<>();
        Map<String, Long> provinceExpired = new HashMap<>();
        LocalDate expiringThreshold = LocalDate.now().plusDays(EXPIRING_DAYS);
        for (RsbtStation s : allStations) {
            if (s.getProvince() == null || s.getProvince().isEmpty()) continue;
            // 将数据库省份名映射到标准 key
            String provinceKey = DB_PROVINCE_TO_KEY.getOrDefault(s.getProvince(), s.getProvince().toLowerCase().replace(" ", "-"));
            provinceTotal.merge(provinceKey, 1L, Long::sum);
            if (s.getExpirationdate() != null) {
                if (s.getExpirationdate().isBefore(LocalDate.now())) provinceExpired.merge(provinceKey, 1L, Long::sum);
                else if (!s.getExpirationdate().isAfter(expiringThreshold)) provinceExpiring.merge(provinceKey, 1L, Long::sum);
            }
        }
        List<ProvinceStationVO> result = new ArrayList<>();
        for (Map.Entry<String, String[]> entry : PROVINCE_NAMES.entrySet()) {
            ProvinceStationVO pvo = new ProvinceStationVO();
            pvo.setId(entry.getKey());
            pvo.setName(entry.getValue()[0]);
            pvo.setAbbr(entry.getValue()[1]);
            pvo.setTotal(provinceTotal.getOrDefault(entry.getKey(), 0L));
            pvo.setExpiring60(provinceExpiring.getOrDefault(entry.getKey(), 0L));
            pvo.setExpired(provinceExpired.getOrDefault(entry.getKey(), 0L));
            result.add(pvo);
        }
        return result;
    }

    private List<LicenseTypeStatsVO> buildLicenseTypeStats() {
        List<RsbtStation> allStations = stationMapper.selectList(new LambdaQueryWrapper<>());
        Map<String, Long> typeNormal = new HashMap<>();
        Map<String, Long> typeExpiring = new HashMap<>();
        Map<String, Long> typeExpired = new HashMap<>();
        LocalDate now = LocalDate.now();
        LocalDate expiringThreshold = now.plusDays(EXPIRING_DAYS);
        for (RsbtStation s : allStations) {
            String t = s.getType() != null ? s.getType() : "Unknown";
            if (s.getExpirationdate() == null) {
                typeNormal.merge(t, 1L, Long::sum);
            } else if (s.getExpirationdate().isBefore(now)) {
                typeExpired.merge(t, 1L, Long::sum);
            } else if (!s.getExpirationdate().isAfter(expiringThreshold)) {
                typeExpiring.merge(t, 1L, Long::sum);
            } else {
                typeNormal.merge(t, 1L, Long::sum);
            }
        }
        List<LicenseTypeStatsVO> result = new ArrayList<>();
        for (String type : typeNormal.keySet()) {
            LicenseTypeStatsVO vo = new LicenseTypeStatsVO();
            vo.setId(type.toLowerCase());
            vo.setType(type);
            vo.setNormal(typeNormal.getOrDefault(type, 0L));
            vo.setExpiring(typeExpiring.getOrDefault(type, 0L));
            vo.setExpired(typeExpired.getOrDefault(type, 0L));
            result.add(vo);
        }
        return result;
    }

    private List<StationTypeVO> buildStationTypes() {
        List<RsbtStation> allStations = stationMapper.selectList(new LambdaQueryWrapper<>());
        Map<String, Long> typeCount = new HashMap<>();
        for (RsbtStation s : allStations) {
            String t = s.getType() != null ? s.getType() : "Unknown";
            typeCount.merge(t, 1L, Long::sum);
        }
        List<StationTypeVO> result = new ArrayList<>();
        int idx = 0;
        String[] COLORS = {"#1976d2", "#42a5f5", "#64b5f6", "#90caf9", "#bbdefb"};
        for (Map.Entry<String, Long> e : typeCount.entrySet()) {
            StationTypeVO vo = new StationTypeVO();
            vo.setId(e.getKey().toLowerCase());
            vo.setName(e.getKey());
            vo.setValue(e.getValue());
            vo.setColor(COLORS[idx % COLORS.length]);
            result.add(vo);
            idx++;
        }
        return result;
    }

    private List<StationGrowthVO> buildStationGrowthTrend() {
        List<StationGrowthVO> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i).withDayOfMonth(1);
            LocalDate nextMonth = month.plusMonths(1);
            LambdaQueryWrapper<RsbtStation> w = new LambdaQueryWrapper<>();
            w.ge(RsbtStation::getCreateTime, month.atStartOfDay());
            w.lt(RsbtStation::getCreateTime, nextMonth.atStartOfDay());
            long count = stationMapper.selectCount(w);
            StationGrowthVO vo = new StationGrowthVO();
            vo.setMonth(month.format(DateTimeFormatter.ofPattern("yyyy-MM")));
            vo.setCount(count);
            result.add(vo);
        }
        return result;
    }
    private String calcGrowthRate(long current, long previous) { if (previous == 0) return current > 0 ? "+100.0%" : "+0.0%"; double rate = ((double) (current - previous) / previous) * 100; return (rate >= 0 ? "+" : "") + String.format("%.1f", rate) + "%"; }
}
