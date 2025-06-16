package org.example.shoestorebackend.dto;

public class CartItemDTO {
    private ProductDTO product;
    private String size;
    private String color;
    private Integer quantity;

    // Lớp lồng ProductDTO để ánh xạ phần "product" trong JSON
    public static class ProductDTO {
        private String id;
        private String name;
        private double price;

        // Getters và setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getPrice() {
            return price;
        }

        public void setPrice(double price) {
            this.price = price;
        }
    }

    // Getters và setters cho CartItemDTO
    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}