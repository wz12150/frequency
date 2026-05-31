package com.freqmanage.module.permit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StationPermitUpdateDTO {
    private String stationid;   // FK to RSBT_STATION, optional
    private Integer quantity;
    private BigDecimal outputpower;
    private String type;
    private String frequencyLicense;  // Frequency License 字段
}