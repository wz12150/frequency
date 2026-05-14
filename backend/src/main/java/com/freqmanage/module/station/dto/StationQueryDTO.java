package com.freqmanage.module.station.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
public class StationQueryDTO extends com.freqmanage.common.QueryParam {
    private String type;
    private String technology;
    private String province;
    private String district;
    private String stationtype;
    private LocalDate startDateFrom;
    private LocalDate startDateTo;
    private LocalDate expirationDateFrom;
    private LocalDate expirationDateTo;
}