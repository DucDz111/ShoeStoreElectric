package org.example.shoestorebackend.dto;

import java.time.LocalDateTime;

public class OrderSummaryDTO {
    private Long id;
    private LocalDateTime createdAt;
    private Double totalAmount;
    private String paymentMethod;
    private String status;
}
