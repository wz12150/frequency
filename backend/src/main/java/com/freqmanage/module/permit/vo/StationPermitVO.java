package com.freqmanage.module.permit.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StationPermitVO {
    private String guid;
    private String permitid;
    private Integer quantity;
    private BigDecimal outputpower;
    private String type;
}