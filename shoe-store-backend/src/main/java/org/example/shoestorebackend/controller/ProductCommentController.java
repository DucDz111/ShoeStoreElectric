package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.entity.ProductComment;
import org.example.shoestorebackend.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.shoestorebackend.service.ProductCommentService;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/comments")
public class ProductCommentController {
    @Autowired
    private ProductCommentService productCommentService;

    @GetMapping
    public List<ProductComment> getCommentsByProductId(@PathVariable Long productId) {
        return productCommentService.getCommentsByProductId(productId);
    }

    @PostMapping
    public ResponseEntity<ProductComment> addComment(@PathVariable Long productId, @RequestBody ProductComment comment) {
        comment.setProduct(new Product());
        comment.getProduct().setId(productId);
        return ResponseEntity.ok(productCommentService.addComment(comment));
    }
}
