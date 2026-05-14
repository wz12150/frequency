package com.freqmanage.module.station.vo;

import lombok.Data;

@Data
public class StationStatsVO {
    private Long totalCount;
    private Long validCount;
    private Long expiredCount;
    private String topProvince;
    private String topType;
}