package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductIdAndVariantId(Long userId, Long productId, Long variantId);
    void deleteByUserId(Long userId);
}