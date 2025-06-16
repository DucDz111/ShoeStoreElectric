package org.example.shoestorebackend.entity;

public class DashboardStats {
    private double totalRevenue;
    private long orderCount;
    private String topCustomerName;

    public DashboardStats(double totalRevenue, long orderCount, String topCustomerName) {
        this.totalRevenue = totalRevenue;
        this.orderCount = orderCount;
        this.topCustomerName = topCustomerName;
    }

    // Getters
    public double getTotalRevenue() { return totalRevenue; }
    public long getOrderCount() { return orderCount; }
    public String getTopCustomerName() { return topCustomerName; }

    // Setters (nếu cần)
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
    public void setTopCustomerName(String topCustomerName) { this.topCustomerName = topCustomerName; }
}
