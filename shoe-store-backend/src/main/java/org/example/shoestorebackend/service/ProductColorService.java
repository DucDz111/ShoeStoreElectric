package org.example.shoestorebackend.service;

import org.example.shoestorebackend.dto.ProductColorDTO;
import org.example.shoestorebackend.entity.ProductColor;
import org.example.shoestorebackend.entity.ProductSize;
import org.example.shoestorebackend.repository.ProductColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductColorService {
    @Autowired
    private ProductColorRepository productColorRepository;

    public ProductColor save(ProductColor productColor) {
        return productColorRepository.save(productColor);
    }

    public ProductColorDTO save(ProductColorDTO productColorDTO) {
        ProductColor productColor = new ProductColor();
        productColor.setId(productColorDTO.getId());
        productColor.setColor(productColorDTO.getColor());
        ProductColor savedColor = productColorRepository.save(productColor);
        return new ProductColorDTO(savedColor.getId(), savedColor.getColor());
    }

    public List<ProductColorDTO> getColorsByProductId(Long productId) {
        return List.of(); // Logic cũ không hợp lệ, bạn có thể lấy từ ProductVariant nếu cần
    }
    public ProductColor findOrCreate(String colorValue) {
        return productColorRepository.findByColor(colorValue.trim())
                .orElseGet(() -> productColorRepository.save(new ProductColor(null, colorValue.trim())));
    }
}