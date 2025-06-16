package org.example.shoestorebackend.service;

import org.example.shoestorebackend.entity.ProductComment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.example.shoestorebackend.repository.ProductCommentRepository;

import java.util.List;

@Service
public class ProductCommentService {
    @Autowired
    private ProductCommentRepository productCommentRepository;

    public List<ProductComment> getCommentsByProductId(Long productId) {
        return productCommentRepository.findByProductId(productId);
    }

    public ProductComment addComment(ProductComment comment) {
        return productCommentRepository.save(comment);
    }
}
