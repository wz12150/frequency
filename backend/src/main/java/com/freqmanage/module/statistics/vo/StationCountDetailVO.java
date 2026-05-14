package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class StationCountDetailVO {
    private String type;
    private Long licenses;
    private Long stations;
    private Double ratio;
    private String province;
    private String date;
}