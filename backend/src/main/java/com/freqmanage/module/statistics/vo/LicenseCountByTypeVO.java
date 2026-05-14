package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class LicenseCountByTypeVO {
    private String type;
    private Long count;
    private String province;
    private String date;
    private String period;
}