package com.freqmanage.module.planning.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("RSBT_PLANNNING")
public class RsbtPlanning {
    @TableId("GUID")
    private String guid;
    private String radioservices;
    private String subservices;
    private String level;
    private String segmentname;
    private String startfrequency;
    private String stopfrequency;
    private String step;
    private String bandwidth;
    private String remark;
    /** 业务类型，从数据字典 ServiceType 获取 */
    @TableField("SERVICETYPE")
    private String serviceType;
    /** 频段类型，从数据字典 BandType 获取 */
    @TableField("BANGTYPE")
    private String bandType;
}
