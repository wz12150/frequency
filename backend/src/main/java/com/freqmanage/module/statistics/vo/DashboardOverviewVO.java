package com.freqmanage.module.statistics.vo;

import lombok.Data;

import java.util.List;

@Data
public class DashboardOverviewVO {
    // KPI cards
    private Long totalStations;
    private Long normalLicenses;
    private Long expiringSoon;
    private Long expired;
    // 增长率
    private String stationGrowth;
    private String licenseGrowth;
    private String expiringGrowth;
    private String expiredGrowth;
    // 省份台站统计列表
    private List<ProvinceStationVO> provinceStats;
    // 许可证类型统计列表
    private List<LicenseTypeStatsVO> licenseTypeStats;
    // 台站类型分布（用于饼图）
    private List<StationTypeVO> stationTypes;
    // 台站增长趋势（最近12个月）
    private List<StationGrowthVO> stationGrowthTrend;
}