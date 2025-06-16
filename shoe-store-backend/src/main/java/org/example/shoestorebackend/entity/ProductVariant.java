package org.example.shoestorebackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_variants")
@Data
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id", nullable = false)
    @JsonBackReference
    private ProductSize size;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id", nullable = false)
    @JsonBackReference
    private ProductColor color;

    @Column(nullable = false)
    private int quantity;

    public ProductVariant() {
    }

    public ProductVariant(Long id, Product product, ProductSize size, ProductColor color, int quantity) {
        this.id = id;
        this.product = product;
        this.size = size;
        this.color = color;
        this.quantity = quantity;
    }
}