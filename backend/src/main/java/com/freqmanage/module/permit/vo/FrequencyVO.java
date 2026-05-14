package com.freqmanage.module.permit.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FrequencyVO {
    private String guid;
    private String permitid;
    private BigDecimal frequency;
    private BigDecimal badnwidth;
}