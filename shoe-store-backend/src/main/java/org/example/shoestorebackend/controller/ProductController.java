package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.dto.ProductColorDTO;
import org.example.shoestorebackend.dto.ProductDTO;
import org.example.shoestorebackend.dto.ProductSizeDTO;
import org.example.shoestorebackend.dto.ProductVariantDTO;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.service.ProductColorService;
import org.example.shoestorebackend.service.ProductFeatureService;
import org.example.shoestorebackend.service.ProductService;
import org.example.shoestorebackend.service.ProductSizeService;
import org.example.shoestorebackend.service.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    private static final Logger logger = Logger.getLogger(ProductController.class.getName());

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductFeatureService productFeatureService;

    @Autowired
    private ProductSizeService productSizeService;

    @Autowired
    private ProductColorService productColorService;

    @Autowired
    private ProductVariantService productVariantService;

    @GetMapping
    public ResponseEntity<Object> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort
    ) {
        try {
            logger.info("Fetching all products - page: " + page + ", size: " + size + ", sort: " + sort);

            Sort sortOption = Sort.by("id").descending(); // Mặc định là mới nhất
            if ("priceAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").ascending();
            else if ("priceDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").descending();
            else if ("alphaAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").ascending();
            else if ("alphaDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").descending();
            else if ("new".equalsIgnoreCase(sort)) sortOption = Sort.by("createdAt").descending();
            else if ("best-seller".equalsIgnoreCase(sort)) sortOption = Sort.by("sold").descending();

            Pageable pageable = PageRequest.of(page, size, sortOption);
            Page<ProductDTO> productPage = productService.getAllProducts(pageable);

            if (productPage.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No products found"));
            }

            Page<Map<String, Object>> responsePage = productPage.map(product -> {
                Map<String, Object> map = new HashMap<>();
                map.put("product", product);
                map.put("features", productFeatureService.getFeaturesByProductId(product.getId()));
                map.put("sizes", product.getSizes());
                map.put("colors", product.getColors());
                map.put("variants", product.getVariants());
                return map;
            });

            return ResponseEntity.ok(responsePage);
        } catch (Exception e) {
            logger.severe("Error fetching all products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getProductById(@PathVariable Long id) {
        try {
            logger.info("Fetching product with id: " + id);
            ProductDTO product = productService.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found with id: " + id));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("product", product);
            response.put("features", productFeatureService.getFeaturesByProductId(id));
            response.put("sizes", product.getSizes());
            response.put("colors", product.getColors());
            response.put("variants", product.getVariants());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error fetching product by id: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid product id or server error: " + e.getMessage()));
        }
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<Object> getProductsByCategoryPaginated(
            @PathVariable String categoryName,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort
    ) {
        try {
            categoryName = UriUtils.decode(categoryName, StandardCharsets.UTF_8).trim().replaceAll("[\\n\\r]", "");
            logger.info("Fetching paginated products for category: " + categoryName + ", gender: " + gender + ", page: " + page + ", size: " + size + ", sort: " + sort);

            Product.Gender genderEnum = null;
            if (gender != null && !gender.isEmpty()) {
                try {
                    genderEnum = Product.Gender.valueOf(gender.trim().toLowerCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid gender value"));
                }
            }

            Sort sortOption = Sort.by("id").descending(); // Mặc định là mới nhất
            if ("priceAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").ascending();
            else if ("priceDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").descending();
            else if ("alphaAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").ascending();
            else if ("alphaDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").descending();
            else if ("new".equalsIgnoreCase(sort)) sortOption = Sort.by("createdAt").descending();
            else if ("best-seller".equalsIgnoreCase(sort)) sortOption = Sort.by("sold").descending();

            Pageable pageable = PageRequest.of(page, size, sortOption);

            Page<ProductDTO> productPage;
            if ("all".equalsIgnoreCase(categoryName)) {
                productPage = productService.getProductsByAllWithPaging(genderEnum, pageable);
            } else {
                productPage = productService.getProductsByCategoryPaging(categoryName, genderEnum, pageable);
            }

            Page<Map<String, Object>> responsePage = productPage.map(product -> {
                Map<String, Object> map = new HashMap<>();
                map.put("product", product);
                map.put("features", productFeatureService.getFeaturesByProductId(product.getId()));
                map.put("sizes", product.getSizes());
                map.put("colors", product.getColors());
                map.put("variants", product.getVariants());
                return map;
            });

            return ResponseEntity.ok(responsePage);
        } catch (Exception e) {
            logger.severe("Error fetching paginated products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchProducts(
            @RequestParam("q") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort
    ) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Keyword is required"));
            }

            Sort sortOption = Sort.by("id").descending(); // Mặc định là mới nhất
            if ("priceAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").ascending();
            else if ("priceDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("price").descending();
            else if ("alphaAsc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").ascending();
            else if ("alphaDesc".equalsIgnoreCase(sort)) sortOption = Sort.by("name").descending();
            else if ("new".equalsIgnoreCase(sort)) sortOption = Sort.by("createdAt").descending();
            else if ("best-seller".equalsIgnoreCase(sort)) sortOption = Sort.by("sold").descending();

            Pageable pageable = PageRequest.of(page, size, sortOption);

            Page<ProductDTO> productPage = productService.searchProducts(keyword.trim(), pageable);

            Page<Map<String, Object>> responsePage = productPage.map(product -> {
                Map<String, Object> map = new HashMap<>();
                map.put("product", product);
                map.put("features", productFeatureService.getFeaturesByProductId(product.getId()));
                map.put("sizes", product.getSizes());
                map.put("colors", product.getColors());
                map.put("variants", product.getVariants());
                return map;
            });

            return ResponseEntity.ok(responsePage);
        } catch (Exception e) {
            logger.severe("Error searching products with pagination: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}