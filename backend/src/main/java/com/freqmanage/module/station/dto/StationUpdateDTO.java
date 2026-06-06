package com.freqmanage.module.station.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class StationUpdateDTO {
    private String type;
    private String technology;
    private String bbumodel;
    private String ownedsite;
    private String backbone;
    private String stationpurpose;
    private String modulation;
    private String stationtype;
    private BigDecimal frequencyt;
    private BigDecimal frequencyr;
    private BigDecimal bandwidth;
    private String bandwidthprocessingunitmodel;
    private String devicemodel;
    private Integer devicequantity;
    private BigDecimal outputpower;
    private String anttype;
    private Integer antquantity;
    private String province;
    private String district;
    private String location;
    private String sitename;
    private String unit;
    private String equipname;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private LocalDate startdate;
    private LocalDate expirationdate;
    private String frequencyLicense;  // Frequency License 字段
}