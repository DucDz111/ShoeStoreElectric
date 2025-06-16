package org.example.shoestorebackend.service;

import org.example.shoestorebackend.entity.ProductFeature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.example.shoestorebackend.repository.ProductFeatureRepository;

import java.util.List;

@Service
public class ProductFeatureService {
    @Autowired
    private ProductFeatureRepository productFeatureRepository;
    public List<ProductFeature> getFeaturesByProductId(Long productId) {
        return productFeatureRepository.findByProductId(productId);
    }
}
