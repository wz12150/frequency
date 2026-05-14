package com.freqmanage.module.permit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FrequencyUpdateDTO {
    private BigDecimal frequency;
    private BigDecimal badnwidth;
}