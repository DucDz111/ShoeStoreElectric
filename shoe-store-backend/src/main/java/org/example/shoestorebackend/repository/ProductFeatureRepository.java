package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.ProductFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductFeatureRepository extends JpaRepository<ProductFeature, Long> {
    List<ProductFeature> findByProductId(Long productId);
}
