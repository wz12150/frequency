package com.freqmanage.module.statistics.vo;

import lombok.Data;
import java.util.Map;

@Data
public class StationRegionDetailVO {
    private String region;
    private Long mobile;
    private Long broadcast;
    private Long fixed;
    private Long satellite;
    private Long other;
    private Long total;

    private static String normalizeType(String type) {
        if (type == null) return "Other";
        String t = type.toLowerCase();
        if (t.contains("mobile") || t.contains("宏站") || t.contains("基站") || t.contains("base station")) return "Mobile";
        if (t.contains("broadcast") || t.contains("广播") || t.contains("tv") || t.contains("dtv")) return "Broadcasting";
        if (t.contains("fixed") || t.contains("固定") || t.contains("微波") || t.contains("microwave")) return "Fixed";
        if (t.contains("satellite") || t.contains("卫星") || t.contains("vsat")) return "Satellite";
        return "Other";
    }

    public static StationRegionDetailVO from(String region, Map<String, Long> typeCountMap) {
        StationRegionDetailVO vo = new StationRegionDetailVO();
        vo.setRegion(region);

        long mobile = 0, broadcast = 0, fixed = 0, satellite = 0, other = 0;
        for (Map.Entry<String, Long> entry : typeCountMap.entrySet()) {
            String normalized = normalizeType(entry.getKey());
            long count = entry.getValue();
            switch (normalized) {
                case "Mobile": mobile = count; break;
                case "Broadcasting": broadcast = count; break;
                case "Fixed": fixed = count; break;
                case "Satellite": satellite = count; break;
                default: other += count;
            }
        }

        vo.setMobile(mobile);
        vo.setBroadcast(broadcast);
        vo.setFixed(fixed);
        vo.setSatellite(satellite);
        vo.setOther(other);
        vo.setTotal(mobile + broadcast + fixed + satellite + other);
        return vo;
    }
}