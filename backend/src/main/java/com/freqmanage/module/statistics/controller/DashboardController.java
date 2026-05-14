package com.freqmanage.module.statistics.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.module.statistics.service.DashboardService;
import com.freqmanage.module.statistics.vo.DashboardOverviewVO;
import com.freqmanage.module.statistics.vo.StationGrowthVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    public ApiResponse<DashboardOverviewVO> overview() {
        return ApiResponse.ok(dashboardService.getOverview());
    }

    @GetMapping("/station-type")
    public ApiResponse<Map<String, Long>> stationType() {
        return ApiResponse.ok(dashboardService.getStationTypeDistribution());
    }

    @GetMapping("/permit-status")
    public ApiResponse<Map<String, Long>> permitStatus() {
        return ApiResponse.ok(dashboardService.getPermitStatusDistribution());
    }

    @GetMapping("/province-station")
    public ApiResponse<Map<String, Long>> provinceStation() {
        return ApiResponse.ok(dashboardService.getProvinceStationCount());
    }

    @GetMapping("/station-growth")
    public ApiResponse<StationGrowthVO> stationGrowth() {
        return ApiResponse.ok(dashboardService.getStationGrowth());
    }
}