package org.example.shoestorebackend.dto;

import lombok.Data;
import org.example.shoestorebackend.entity.Product;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String model;
    private Double price;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String category;
    private Product.Gender gender;
    private List<ProductSizeDTO> sizes;
    private List<ProductColorDTO> colors;
    private List<ProductVariantDTO> variants;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Product.Gender getGender() {
        return gender;
    }

    public void setGender(Product.Gender gender) {
        this.gender = gender;
    }

    public List<ProductSizeDTO> getSizes() {
        return sizes;
    }

    public void setSizes(List<ProductSizeDTO> sizes) {
        this.sizes = sizes;
    }

    public List<ProductColorDTO> getColors() {
        return colors;
    }

    public void setColors(List<ProductColorDTO> colors) {
        this.colors = colors;
    }

    public List<ProductVariantDTO> getVariants() {
        return variants;
    }

    public void setVariants(List<ProductVariantDTO> variants) {
        this.variants = variants;
    }
}