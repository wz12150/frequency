package com.freqmanage.module.planning.entity;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("RSBT_PLANNNING")
public class RsbtPlanning {
    @TableId("GUID")
    @ExcelProperty("GUID")
    private String guid;

    @ExcelProperty("Radioservices")
    private String radioservices;

    @ExcelProperty("Subservices")
    private String subservices;

    @ExcelProperty("Level")
    private String level;

    @ExcelProperty("Band Name")
    private String segmentname;

    @ExcelProperty("Start Frequency")
    private String startfrequency;

    @ExcelProperty("End Frequency")
    private String stopfrequency;

    @ExcelProperty("Step")
    private String step;

    @ExcelProperty("Signal Bandwidth")
    private String bandwidth;

    @ExcelProperty("Notes")
    private String remark;

    /** 业务类型，从数据字典 ServiceType 获取 */
    @TableField("SERVICETYPE")
    @ExcelProperty("Service Type")
    private String serviceType;

    /** 频段类型，从数据字典 BandType 获取 */
    @TableField("BANGTYPE")
    @ExcelProperty("Band Type")
    private String bandType;
}
