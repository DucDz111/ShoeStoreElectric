package org.example.shoestorebackend.dto;

import lombok.Data;

@Data
public class ProductSizeDTO {
    private Long id;
    private String size;

    public ProductSizeDTO() {}

    public ProductSizeDTO(Long id, String size) {
        this.id = id;
        this.size = size;
    }
}