package org.example.shoestorebackend.service;

import org.example.shoestorebackend.entity.ProductLike;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.example.shoestorebackend.repository.ProductLikeRepository;

import java.util.List;

@Service
public class ProductLikeService {
    @Autowired
    private ProductLikeRepository productLikeRepository;

    public List<ProductLike> getLikesByUserId(Long userId) {
        return productLikeRepository.findByUserId(userId);
    }

    public ProductLike addLike(Long userId, Long productId) {
        ProductLike productLike = new ProductLike();
        productLike.setUser(new User());
        productLike.getUser().setId(userId);
        productLike.setProduct(new Product());
        productLike.getProduct().setId(productId);
        return productLikeRepository.save(productLike);
    }

    public void removeLike(Long userId, Long productId) {
        productLikeRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(productLike -> productLikeRepository.delete(productLike));
    }
}
