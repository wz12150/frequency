package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class MonthlyGrowthVO {
    private String month;          // "Jan", "Feb"...
    private Long current;          // 当前年份该月总数
    private Long previous;         // 去年同月总数
    private Long growthCount;      // 同比增长数量
    private Double growthPercent;  // 同比增长百分比
    private Long momCount;         // 环比增长数量
    private Double momPercent;     // 环比增长百分比
}