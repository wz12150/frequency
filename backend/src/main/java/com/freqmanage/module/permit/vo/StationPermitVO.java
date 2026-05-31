package com.freqmanage.module.permit.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StationPermitVO {
    private String guid;
    private String permitid;
    private String stationid;        // FK to RSBT_STATION
    private String stationName;      // From RSBT_STATION.SITENAME
    private String stationType;      // From RSBT_STATION.STATIONTYPE
    private String stationProvince;  // From RSBT_STATION.PROVINCE
    private String stationUnit;      // From RSBT_STATION.UNIT
    private Integer quantity;
    private BigDecimal outputpower;
    private String type;
    private String frequencyLicense;  // Frequency License 字段
}