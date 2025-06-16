package org.example.shoestorebackend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @ManyToOne
    @JoinColumn(name = "discount_code_id")
    private DiscountCode discountCode;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "order_note")
    private String orderNote;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // Thêm trường paymentMethod

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Thêm mối quan hệ @OneToMany với OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems = new ArrayList<>();

    public enum Status {
        PENDING,
        SHIPPING,
        DELIVERED,
        PROCESSING,
        CANCELLED
    }

    public Order() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = Status.PENDING; // Mặc định là PENDING
        this.paymentMethod = "COD"; // Mặc định là COD
    }
}