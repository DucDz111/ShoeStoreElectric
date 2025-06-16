package org.example.shoestorebackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cart_items",  uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id", "variant_id"}))
@Data
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;
}