package org.example.shoestorebackend.dto;

import lombok.Data;

@Data
public class ProductColorDTO {
    private Long id;
    private String color;

    public ProductColorDTO() {}

    public ProductColorDTO(Long id, String color) {
        this.id = id;
        this.color = color;
    }
}