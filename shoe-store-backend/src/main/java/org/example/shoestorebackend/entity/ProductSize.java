package org.example.shoestorebackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "product_sizes")
@Data
public class ProductSize {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String size;

    public ProductSize() {
    }

    public ProductSize(Long id, String size) {
        this.id = id;
        this.size = size;
    }
}