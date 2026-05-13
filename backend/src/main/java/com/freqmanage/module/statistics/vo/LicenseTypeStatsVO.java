package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class LicenseTypeStatsVO {
    private String id;
    private String type;
    private Long normal;
    private Long expiring;
    private Long expired;
}