package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.entity.ProductLike;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.shoestorebackend.service.ProductLikeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductLikeController {
    @Autowired
    private ProductLikeService productLikeService;

    @GetMapping("/likes/{userId}")
    public List<ProductLike> getLikesByUserId(@PathVariable Long userId) {
        return productLikeService.getLikesByUserId(userId);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ProductLike> addLike(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        return ResponseEntity.ok(productLikeService.addLike(userId, id));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> removeLike(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        productLikeService.removeLike(userId, id);
        return ResponseEntity.noContent().build();
    }
}
