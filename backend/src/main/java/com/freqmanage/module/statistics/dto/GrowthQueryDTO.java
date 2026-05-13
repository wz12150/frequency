package com.freqmanage.module.statistics.dto;

import lombok.Data;

@Data
public class GrowthQueryDTO {
    private String type = "All";       // 站型筛选
    private Integer year;             // 年份
    private String province = "All";   // 省份筛选
}