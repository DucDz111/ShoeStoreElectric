package org.example.shoestorebackend.dto;

import org.example.shoestorebackend.entity.Product;

import java.util.List;

public class CartItemResponseDTO {
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

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

    private Long id;
    private UserDTO user;
    private ProductDTO product;
    private String size;
    private String color;
    private Integer quantity;

    public static class UserDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;

        // Getters và setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }

    public static class ProductDTO {
        private String id;
        private String name;
        private Double price;
        private String imageUrl;
        private String category;
        private Product.Gender gender;
        private List<String> sizes; // Thêm danh sách kích thước
        private List<String> colors; // Thêm danh sách màu sắc

        // Constructors
        public ProductDTO() {
        }

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

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
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

        public List<String> getSizes() {
            return sizes;
        }

        public void setSizes(List<String> sizes) {
            this.sizes = sizes;
        }

        public List<String> getColors() {
            return colors;
        }

        public void setColors(List<String> colors) {
            this.colors = colors;
        }

        public ProductDTO(String id, String name, Double price, String imageUrl, String category,
                          Product.Gender gender, List<String> sizes, List<String> colors) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.imageUrl = imageUrl;
            this.category = category;
            this.gender = gender;
            this.sizes = sizes;
            this.colors = colors;
        }
        // Getters và setters

    }
}
