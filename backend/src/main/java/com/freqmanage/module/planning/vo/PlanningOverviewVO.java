package com.freqmanage.module.planning.vo;

import lombok.Data;

@Data
public class PlanningOverviewVO {
    private Long totalCount;
    private String minFrequency;
    private String maxFrequency;
    private Long serviceTypeCount;
}