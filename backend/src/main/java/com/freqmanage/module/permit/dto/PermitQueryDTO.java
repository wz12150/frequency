package com.freqmanage.module.permit.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
public class PermitQueryDTO extends com.freqmanage.common.QueryParam {
    private String consent;
    private String category;
    private String status;
    private String type;
    private LocalDate startDateFrom;
    private LocalDate startDateTo;
    private LocalDate endDateFrom;
    private LocalDate endDateTo;
    private String province;
}