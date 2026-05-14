package com.freqmanage.module.station.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("RSBT_STATION")
public class RsbtStation {
    @TableId("GUID")
    private String guid;
    private String type;
    private String technology;
    private String bbumodel;
    private String ownedsite;
    private String backbone;
    private String stationpurpose;
    private String modulation;
    private String stationtype;
    private BigDecimal frequencyt;
    private BigDecimal frequencyr;
    private BigDecimal bandwidth;
    private String devicemodel;
    private Integer devicequantity;
    private BigDecimal outputpower;
    private String anttype;
    private Integer antquantity;
    private String province;
    private String district;
    private String location;
    private String sitename;
    private String unit;           // 设台单位
    private String equipname;      // 设备名称
    private BigDecimal longitude;
    private BigDecimal latitude;
    private LocalDate startdate;
    private LocalDate expirationdate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
}
