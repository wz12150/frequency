package com.freqmanage.module.planning.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class PlanningQueryDTO extends com.freqmanage.common.QueryParam {
    private String radioservices;
    private String subservices;
    private String level;
    private String segmentname;
}