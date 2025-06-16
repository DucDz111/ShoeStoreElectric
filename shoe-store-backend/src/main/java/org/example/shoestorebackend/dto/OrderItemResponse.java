package org.example.shoestorebackend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrderItemResponse {
    private Long orderId;
    private String productName;
    private String size;
    private String color;
    private int quantity;
    private double price;
    private String customerName;
    private LocalDateTime orderDate;
}
