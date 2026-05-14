package com.freqmanage.module.planning.dto;

import lombok.Data;

@Data
public class PlanningUpdateDTO {
    private String radioservices;
    private String subservices;
    private String level;
    private String segmentname;
    private String startfrequency;
    private String stopfrequency;
    private String step;
    private String bandwidth;
    private String remark;
}