package com.freqmanage.module.permit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FrequencyCreateDTO {
    private String permitid;
    private BigDecimal frequency;
    private BigDecimal badnwidth;
}