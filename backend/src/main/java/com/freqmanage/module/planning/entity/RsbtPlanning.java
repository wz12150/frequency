package com.freqmanage.module.planning.entity;

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
}
