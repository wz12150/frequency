package com.freqmanage.module.statistics.controller;

import com.freqmanage.common.ApiResponse;
import com.freqmanage.module.statistics.service.StatisticsService;
import com.freqmanage.module.statistics.vo.PermitUsageGrowthVO;
import com.freqmanage.module.statistics.vo.ProvinceStationVO;
import com.freqmanage.module.statistics.vo.StationGrowthVO;
import com.freqmanage.module.statistics.vo.StationRegionDetailVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/station/region")
    public ApiResponse<List<ProvinceStationVO>> stationRegion() {
        return ApiResponse.ok(statisticsService.getStationRegionStats());
    }

    @GetMapping("/station/growth")
    public ApiResponse<StationGrowthVO> stationGrowth() {
        return ApiResponse.ok(statisticsService.getStationGrowth());
    }

    @GetMapping("/station/expired")
    public ApiResponse<Map<String, Long>> expiredStation() {
        return ApiResponse.ok(statisticsService.getExpiredStationStats());
    }

    @GetMapping("/station/valid")
    public ApiResponse<Map<String, Long>> validStation() {
        return ApiResponse.ok(statisticsService.getValidStationStats());
    }

    @GetMapping("/permit/usage-growth")
    public ApiResponse<PermitUsageGrowthVO> permitUsageGrowth() {
        return ApiResponse.ok(statisticsService.getPermitUsageGrowth());
    }

    @GetMapping("/permit/count")
    public ApiResponse<Map<String, Long>> permitCount() {
        return ApiResponse.ok(statisticsService.getPermitCountByStatus());
    }

    @GetMapping("/permit/station-count")
    public ApiResponse<Map<String, Long>> permitStationCount() {
        return ApiResponse.ok(statisticsService.getPermitStationCount());
    }

    @GetMapping("/permit/expiry")
    public ApiResponse<Map<String, Long>> permitExpiry() {
        return ApiResponse.ok(statisticsService.getPermitExpiryStats());
    }

    @GetMapping("/station/region-detail")
    public ApiResponse<List<StationRegionDetailVO>> stationRegionDetail() {
        return ApiResponse.ok(statisticsService.getRegionStats());
    }
}