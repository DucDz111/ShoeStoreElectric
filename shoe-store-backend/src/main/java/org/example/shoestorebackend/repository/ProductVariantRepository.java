package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    @Query("SELECT pv FROM ProductVariant pv " +
            "LEFT JOIN FETCH pv.size " +
            "LEFT JOIN FETCH pv.color " +
            "WHERE pv.product.id = :productId")
    List<ProductVariant> findByProductId(@Param("productId") Long productId);

    @Query("SELECT pv FROM ProductVariant pv " +
            "LEFT JOIN FETCH pv.size " +
            "LEFT JOIN FETCH pv.color " +
            "WHERE pv.product.id = :productId AND pv.size.size = :size AND pv.color.color = :color")
    Optional<ProductVariant> findByProductIdAndSizeSizeAndColorColor(
            @Param("productId") Long productId,
            @Param("size") String size,
            @Param("color") String color);
    List<ProductVariant> findByProduct(Product product);

}