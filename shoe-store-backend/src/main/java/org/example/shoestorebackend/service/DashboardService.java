package org.example.shoestorebackend.service;

import org.example.shoestorebackend.entity.Order;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.entity.DashboardStats;
import org.example.shoestorebackend.entity.RevenueChartData;
import org.example.shoestorebackend.repository.OrderRepository;
import org.example.shoestorebackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DashboardService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public DashboardStats getDashboardStats(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Order> deliveredOrders = orderRepository.findDeliveredOrdersByDate(startDate, endDate);
        double totalRevenue = deliveredOrders.stream()
                .mapToDouble(order -> order.getTotalAmount() - (order.getDiscountAmount() != null ? order.getDiscountAmount() : 0))
                .sum();
        long orderCount = deliveredOrders.size();

        Optional<User> topCustomer = userRepository.findAll().stream()
                .max((u1, u2) -> {
                    long count1 = deliveredOrders.stream().filter(o -> o.getUser().getId().equals(u1.getId())).count();
                    long count2 = deliveredOrders.stream().filter(o -> o.getUser().getId().equals(u2.getId())).count();
                    return Long.compare(count1, count2);
                });
        String topCustomerName = topCustomer.map(user -> user.getFirstName() + " " + user.getLastName()).orElse(null);

        return new DashboardStats(totalRevenue, orderCount, topCustomerName);
    }

    public RevenueChartData getRevenueChartData(int year) {
        RevenueChartData chartData = new RevenueChartData();
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            YearMonth yearMonth = YearMonth.of(year, month);
            LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
            LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

            List<Order> deliveredOrders = orderRepository.findDeliveredOrdersByDate(startDate, endDate);
            double monthlyRevenue = deliveredOrders.stream()
                    .mapToDouble(order -> order.getTotalAmount() - (order.getDiscountAmount() != null ? order.getDiscountAmount() : 0))
                    .sum();

            labels.add(yearMonth.getMonth().toString().substring(0, 3)); // Ví dụ: "JAN", "FEB"
            data.add(monthlyRevenue);
        }

        chartData.setLabels(labels);
        chartData.setData(data);
        return chartData;
    }
}