package org.example.shoestorebackend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(exclude = "variants") // tránh vòng lặp khi so sánh
@ToString(exclude = "variants")          // tránh vòng lặp khi in log
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String model;

    @Column(nullable = false)
    private Double price;

    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductVariant> variants = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Lấy danh sách size từ danh sách variants
    public List<ProductSize> getSizes() {
        if (variants == null || variants.isEmpty()) {
            return new ArrayList<>();
        }
        return variants.stream()
                .map(ProductVariant::getSize)
                .distinct()
                .collect(Collectors.toList());
    }

    // Lấy danh sách color từ danh sách variants
    public List<ProductColor> getColors() {
        if (variants == null || variants.isEmpty()) {
            return new ArrayList<>();
        }
        return variants.stream()
                .map(ProductVariant::getColor)
                .distinct()
                .collect(Collectors.toList());
    }

    public enum Gender {
        nam, nu, tre_em
    }
}
