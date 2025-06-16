package org.example.shoestorebackend.dto;

import lombok.Data;

@Data
public class ProductVariantDTO {
    private Long id;
    private ProductSizeDTO size;
    private ProductColorDTO color;
    private int quantity;

    public ProductVariantDTO() {}

    public ProductVariantDTO(Long id, ProductSizeDTO size, ProductColorDTO color, int quantity) {
        this.id = id;
        this.size = size;
        this.color = color;
        this.quantity = quantity;
    }
}