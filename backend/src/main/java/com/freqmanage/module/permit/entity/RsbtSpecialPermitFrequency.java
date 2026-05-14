package com.freqmanage.module.permit.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("RSBT_SPECIAL_PERMIT_FREQUENCY")
public class RsbtSpecialPermitFrequency {
    @TableId("GUID")
    private String guid;
    private String permitid;
    private BigDecimal frequency;
    private BigDecimal badnwidth;
}
