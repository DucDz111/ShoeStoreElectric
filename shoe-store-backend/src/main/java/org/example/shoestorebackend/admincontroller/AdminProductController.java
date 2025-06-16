package org.example.shoestorebackend.admincontroller;

import org.example.shoestorebackend.dto.ProductColorDTO;
import org.example.shoestorebackend.dto.ProductDTO;
import org.example.shoestorebackend.dto.ProductSizeDTO;
import org.example.shoestorebackend.dto.ProductVariantDTO;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
    private static final Logger logger = Logger.getLogger(AdminProductController.class.getName());

    @Autowired
    private ProductService productService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Object> getAllProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String name // Thêm tham số tìm kiếm theo tên
    ) {
        try {
            logger.info("Fetching paginated products for admin - page: " + page + ", size: " + size + ", sort: " + sort + ", name: " + name);

            Sort sortOption = Sort.by("id").ascending(); // Mặc định là id tăng dần
            if ("priceAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").ascending();
            else if ("priceDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").descending();
            else if ("alphaAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").ascending();
            else if ("alphaDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").descending();
            else if ("new".equalsIgnoreCase(sort)) sortOption = Sort.by("createdAt").descending();
            else if ("idAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("id").ascending();

            Pageable pageable = PageRequest.of(page, size, sortOption);
            Page<ProductDTO> productPage;
            if (name != null && !name.trim().isEmpty()) {
                productPage = productService.searchProducts(name, pageable); // Sử dụng phương thức tìm kiếm
            } else {
                productPage = productService.getAllProducts(pageable);
            }

            return ResponseEntity.ok(productPage);
        } catch (Exception e) {
            logger.severe("Error fetching paginated products for admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        try {
            logger.info("Fetching product with id: " + id);
            ProductDTO product = productService.getProductById(id);
            if (product == null) {
                logger.warning("Product with id " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            logger.info("Retrieved product: " + product.getName());
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            logger.severe("Error fetching product by id: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest productRequest) {
        try {
            logger.info("Creating new product: " + productRequest.getName());
            ProductDTO savedProduct = productService.createProductWithVariants(
                    productRequest.getName(),
                    productRequest.getModel(),
                    productRequest.getPrice(),
                    productRequest.getDescription(),
                    productRequest.getImageUrl(),
                    productRequest.getCategory(),
                    productRequest.getGender(),
                    productRequest.getSizes(),
                    productRequest.getColors(),
                    productRequest.getVariants()
            );
            logger.info("Created product with id: " + savedProduct.getId());
            return ResponseEntity.ok(savedProduct);
        } catch (RuntimeException e) {
            logger.severe("Error creating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to create product: " + e.getMessage()));
        }
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProduct(
            @RequestPart("product") ProductRequest productRequest,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            logger.info("Creating new product: " + productRequest.getName());

            String imageUrl = null;

            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                String uploadDir = "D:/shoe-images/";
                File uploadDirectory = new File(uploadDir);
                if (!uploadDirectory.exists()) {
                    uploadDirectory.mkdirs();
                }
                Path imagePath = Paths.get(uploadDir + fileName);
                Files.copy(imageFile.getInputStream(), imagePath, StandardCopyOption.REPLACE_EXISTING);
                imageUrl = "/images/" + fileName;
            }

            ProductDTO savedProduct = productService.createProductWithVariants(
                    productRequest.getName(),
                    productRequest.getModel(),
                    productRequest.getPrice(),
                    productRequest.getDescription(),
                    imageUrl != null ? imageUrl : productRequest.getImageUrl(),
                    productRequest.getCategory(),
                    productRequest.getGender(),
                    productRequest.getSizes(),
                    productRequest.getColors(),
                    productRequest.getVariants()
            );

            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            logger.severe("Error creating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to create product: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest productDetails) {
        try {
            logger.info("Updating product with id: " + id);
            ProductDTO updatedProduct = productService.updateProductWithVariants(
                    id,
                    productDetails.getName(),
                    productDetails.getModel(),
                    productDetails.getPrice(),
                    productDetails.getDescription(),
                    productDetails.getImageUrl(),
                    productDetails.getCategory(),
                    productDetails.getGender(),
                    productDetails.getSizes(),
                    productDetails.getColors(),
                    productDetails.getVariants()
            );
            logger.info("Updated product: " + updatedProduct.getName());
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            logger.severe("Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to update product: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductRequest productRequest,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            logger.info("Updating product with id: " + id);

            String imageUrl = productRequest.getImageUrl();

            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                String uploadDir = "D:/shoe-images/";
                File uploadDirectory = new File(uploadDir);
                if (!uploadDirectory.exists()) {
                    uploadDirectory.mkdirs();
                }
                Path imagePath = Paths.get(uploadDir + fileName);
                Files.copy(imageFile.getInputStream(), imagePath, StandardCopyOption.REPLACE_EXISTING);
                imageUrl = "/images/" + fileName;
            }

            ProductDTO updatedProduct = productService.updateProductWithVariants(
                    id,
                    productRequest.getName(),
                    productRequest.getModel(),
                    productRequest.getPrice(),
                    productRequest.getDescription(),
                    imageUrl,
                    productRequest.getCategory(),
                    productRequest.getGender(),
                    productRequest.getSizes(),
                    productRequest.getColors(),
                    productRequest.getVariants()
            );

            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            logger.severe("Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to update product: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        logger.info("Deleting product with id: " + id);
        productService.deleteProduct(id);
        logger.info("Deleted product with id: " + id);
        return ResponseEntity.ok().build();
    }

    static class ProductRequest {
        private String name;
        private String model;
        private Double price;
        private String description;
        private String imageUrl;
        private String category;
        private Product.Gender gender;
        private List<ProductSizeDTO> sizes;
        private List<ProductColorDTO> colors;
        private List<ProductVariantDTO> variants;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Product.Gender getGender() { return gender; }
        public void setGender(Product.Gender gender) { this.gender = gender; }
        public List<ProductSizeDTO> getSizes() { return sizes; }
        public void setSizes(List<ProductSizeDTO> sizes) { this.sizes = sizes; }
        public List<ProductColorDTO> getColors() { return colors; }
        public void setColors(List<ProductColorDTO> colors) { this.colors = colors; }
        public List<ProductVariantDTO> getVariants() { return variants; }
        public void setVariants(List<ProductVariantDTO> variants) { this.variants = variants; }
    }
}