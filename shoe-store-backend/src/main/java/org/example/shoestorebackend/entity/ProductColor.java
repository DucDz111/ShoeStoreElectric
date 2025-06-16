package org.example.shoestorebackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_colors")
@Data
public class ProductColor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String color;

    public ProductColor() {
    }

    public ProductColor(Long id, String color) {
        this.id = id;
        this.color = color;
    }
}