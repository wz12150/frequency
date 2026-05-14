package com.freqmanage.module.statistics.vo;

import lombok.Data;
import java.util.Map;

@Data
public class ProvinceStationVO {
    private String id;
    private String name;
    private String abbr;
    private Long total;
    private Long expiring60;
    private Long expired;
    private String province;
    private Long count;
    private Map<String, Long> typeDistribution;
}