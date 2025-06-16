package org.example.shoestorebackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "product_features")
@Data
public class ProductFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(nullable = false)
    private String feature;

    public ProductFeature() {
    }

    public ProductFeature(Long id, Product product, String feature) {
        this.id = id;
        this.product = product;
        this.feature = feature;
    }
}