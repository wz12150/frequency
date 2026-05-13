package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class ProvinceStationVO {
    private String id;
    private String name;
    private String abbr;
    private Long total;
    private Long expiring60;
    private Long expired;
}