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

    public static StationRegionDetailVO from(String region, Map<String, Long> typeCountMap) {
        StationRegionDetailVO vo = new StationRegionDetailVO();
        vo.setRegion(region);
        vo.setMobile(typeCountMap.getOrDefault("Mobile", 0L));
        vo.setBroadcast(typeCountMap.getOrDefault("Broadcasting", 0L));
        vo.setFixed(typeCountMap.getOrDefault("Fixed", 0L));
        vo.setSatellite(typeCountMap.getOrDefault("Satellite", 0L));
        vo.setOther(typeCountMap.getOrDefault("Other", 0L));
        vo.setTotal(vo.getMobile() + vo.getBroadcast() + vo.getFixed()
                  + vo.getSatellite() + vo.getOther());
        return vo;
    }
}