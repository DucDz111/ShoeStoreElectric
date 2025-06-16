package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductColorRepository extends JpaRepository<ProductColor, Long> {
    Optional<ProductColor> findByColor(String color);

}
