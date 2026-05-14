package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class ValidityForecastVO {
    private String month;       // yyyy-MM
    private String province;    // All 或具体省份
    private Long normal;
    private Long expiring;      // 60天内到期
    private Long expired;
}