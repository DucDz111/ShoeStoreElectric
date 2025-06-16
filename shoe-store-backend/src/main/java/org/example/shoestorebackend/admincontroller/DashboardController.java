package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.entity.DashboardStats;
import org.example.shoestorebackend.entity.RevenueChartData;
import org.example.shoestorebackend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/api/admin/revenue-stats")
    public DashboardStats getDashboardStats(@RequestParam int year, @RequestParam int month) {
        return dashboardService.getDashboardStats(year, month);
    }

    @GetMapping("/api/admin/revenue/chart")
    public RevenueChartData getRevenueChartData(@RequestParam int year) {
        return dashboardService.getRevenueChartData(year);
    }
}