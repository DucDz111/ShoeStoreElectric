package org.example.shoestorebackend.service;

import org.example.shoestorebackend.dto.ProductColorDTO;
import org.example.shoestorebackend.dto.ProductSizeDTO;
import org.example.shoestorebackend.dto.ProductVariantDTO;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.entity.ProductVariant;
import org.example.shoestorebackend.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductVariantService {
    @Autowired
    private ProductVariantRepository productVariantRepository;

    public List<ProductVariantDTO> getVariantsByProductId(Long productId) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(productId);
        return variants.stream().map(variant -> {
            ProductVariantDTO variantDTO = new ProductVariantDTO();
            variantDTO.setId(variant.getId());
            variantDTO.setQuantity(variant.getQuantity());

            ProductSizeDTO sizeDTO = new ProductSizeDTO();
            sizeDTO.setId(variant.getSize().getId());
            sizeDTO.setSize(variant.getSize().getSize());
            variantDTO.setSize(sizeDTO);

            ProductColorDTO colorDTO = new ProductColorDTO();
            colorDTO.setId(variant.getColor().getId());
            colorDTO.setColor(variant.getColor().getColor());
            variantDTO.setColor(colorDTO);

            return variantDTO;
        }).collect(Collectors.toList());
    }

    public ProductVariant save(ProductVariant variant) {
        return productVariantRepository.save(variant);
    }
    public List<ProductVariant> findByProduct(Product product) {
        return productVariantRepository.findByProduct(product);
    }
}