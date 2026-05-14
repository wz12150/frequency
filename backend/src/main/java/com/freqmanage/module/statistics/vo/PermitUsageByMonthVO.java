package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class PermitUsageByMonthVO {
    private String month;        // yyyy-MM
    private String businessType; // 对应 permit.category
    private String province;     // 对应 permit.scope 中的省份标注
    private String year;
    private Double usageRate;   // 使用率百分比（计算方式见 service 层）
    private Double yoyGrowth;   // 同比增长率
    private Double momGrowth;   // 环比增长率
    private Double prevYearRate;
    private Double prevMonthRate;
    private Long totalCount;
    private Long activeCount;
}