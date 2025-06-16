package org.example.shoestorebackend.service;

import org.example.shoestorebackend.dto.ProductSizeDTO;
import org.example.shoestorebackend.entity.ProductSize;
import org.example.shoestorebackend.repository.ProductSizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductSizeService {
    @Autowired
    private ProductSizeRepository productSizeRepository;

    public ProductSize save(ProductSize productSize) {
        return productSizeRepository.save(productSize);
    }

    public ProductSizeDTO save(ProductSizeDTO productSizeDTO) {
        ProductSize productSize = new ProductSize();
        productSize.setId(productSizeDTO.getId());
        productSize.setSize(productSizeDTO.getSize());
        ProductSize savedSize = productSizeRepository.save(productSize);
        return new ProductSizeDTO(savedSize.getId(), savedSize.getSize());
    }

    public List<ProductSizeDTO> getSizesByProductId(Long productId) {
        return List.of(); // Logic cũ không hợp lệ, bạn có thể lấy từ ProductVariant nếu cần
    }
    public ProductSize findOrCreate(String sizeValue) {
        return productSizeRepository.findBySize(sizeValue.trim())
                .orElseGet(() -> productSizeRepository.save(new ProductSize(null, sizeValue.trim())));
    }

}