package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.ProductLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {
    List<ProductLike> findByUserId(Long userId);
    Optional<ProductLike> findByUserIdAndProductId(Long userId, Long productId);
}
