package com.freqmanage.module.station.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StationMapVO {
    private String guid;
    private String sitename;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String type;
    private String stationtype;

    // 新增字段
    private String frequency;       // 显示用频率字符串，如 "1800–1900 MHz"，由 FREQUENCYT + FREQUENCYR 拼装
    private BigDecimal freqMHz;     // 中心频率 MHz (数值)，用于筛选
    private String unit;            // 设台单位
    private String equipName;        // 设备名称
    private String equipModel;      // 设备型号 (复用 DEVICEMODEL)
    private String expiry;          // 有效期 (EXPIRATIONDATE 格式化为 yyyy-MM-dd)
    private String power;           // 功率 (OUTPUTPOWER + 'W')
    private String status;           // normal / expiring / expired (由 EXPIRATIONDATE 推算)
    private String province;        // 省份
}
