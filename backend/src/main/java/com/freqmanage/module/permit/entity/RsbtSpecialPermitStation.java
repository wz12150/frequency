package com.freqmanage.module.permit.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("RSBT_SPECIAL_PERMIT_STATION")
public class RsbtSpecialPermitStation {
    @TableId("GUID")
    private String guid;
    private String permitid;
    private Integer quantity;
    private BigDecimal outputpower;
    private String type;
}
