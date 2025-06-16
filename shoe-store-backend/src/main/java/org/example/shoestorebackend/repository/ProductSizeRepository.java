package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> { // Sửa Integer thành Long
    Optional<ProductSize> findBySize(String size);
}