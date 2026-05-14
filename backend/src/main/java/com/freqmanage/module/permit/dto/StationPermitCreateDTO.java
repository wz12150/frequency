package com.freqmanage.module.permit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StationPermitCreateDTO {
    private String permitid;
    private Integer quantity;
    private BigDecimal outputpower;
    private String type;
}