package com.freqmanage.module.statistics.vo;

import lombok.Data;

import java.util.Map;

@Data
public class PermitUsageGrowthVO {
    private Map<String, Long> monthlyData;
    private Double growthRate;
}