package org.example.shoestorebackend.service;

import org.example.shoestorebackend.dto.ProductColorDTO;
import org.example.shoestorebackend.dto.ProductDTO;
import org.example.shoestorebackend.dto.ProductSizeDTO;
import org.example.shoestorebackend.dto.ProductVariantDTO;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.entity.ProductColor;
import org.example.shoestorebackend.entity.ProductSize;
import org.example.shoestorebackend.entity.ProductVariant;
import org.example.shoestorebackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private static final Logger logger = Logger.getLogger(ProductService.class.getName());

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductSizeService productSizeService;

    @Autowired
    private ProductColorService productColorService;

    @Autowired
    private ProductVariantService productVariantService;

    private static final List<String> ADULT_SIZES = Arrays.asList("36", "37", "38", "39", "40", "41", "42", "43", "44", "45");
    private static final List<String> KID_SIZES = Arrays.asList("33", "34", "35", "36", "37", "38", "39", "40");

    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        try {
            logger.info("Fetching all products with pageable: " + pageable);
            Page<Product> productPage = productRepository.findAll(pageable);
            return productPage.map(this::convertToProductDTO);
        } catch (Exception e) {
            logger.severe("Error fetching paged products: " + e.getMessage());
            throw new RuntimeException("Failed to fetch paged products: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        try {
            logger.info("Fetching product by id: " + id);
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
            return convertToProductDTO(product);
        } catch (Exception e) {
            logger.severe("Error fetching product by id: " + e.getMessage());
            throw new RuntimeException("Failed to fetch product: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategory(String categoryName, int page, int size) {
        try {
            if (categoryName == null || categoryName.trim().isEmpty()) {
                logger.warning("Category name is null or empty, returning empty page");
                return Page.empty();
            }
            logger.info("Fetching products for category: " + categoryName + " - page: " + page + ", size: " + size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> productPage = productRepository.findByCategoryName(categoryName, pageable);
            return productPage.map(this::convertToProductDTO);
        } catch (Exception e) {
            logger.severe("Error fetching products by category with pagination: " + e.getMessage());
            throw new RuntimeException("Failed to fetch products by category with pagination: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                logger.warning("Keyword is null or empty, returning all products");
                return getAllProducts(pageable); // Trả về tất cả sản phẩm nếu không có từ khóa
            }

            String trimmedKeyword = keyword.trim().toLowerCase();
            logger.info("Searching products with keyword: " + trimmedKeyword + " - page: " + pageable.getPageNumber() + ", size: " + pageable.getPageSize());

            Page<Product> productPage = productRepository.searchByKeyword(trimmedKeyword, pageable);
            return productPage.map(this::convertToProductDTO);
        } catch (Exception e) {
            logger.severe("Error searching products with pagination: " + e.getMessage());
            throw new RuntimeException("Failed to search products with pagination: " + e.getMessage());
        }
    }

    @Transactional
    public ProductDTO createProductWithVariants(String name, String model, Double price, String description,
                                                String imageUrl, String category, Product.Gender gender,
                                                List<ProductSizeDTO> sizes, List<ProductColorDTO> colors,
                                                List<ProductVariantDTO> variants) {
        try {
            logger.info("Creating product with name: " + name);

            // Kiểm tra model đã tồn tại chưa
            if (productRepository.existsByModel(model)) {
                logger.warning("Model " + model + " already exists");
                throw new RuntimeException("Model " + model + " already exists");
            }

            // Tạo sản phẩm mới
            Product product = new Product();
            product.setName(name);
            product.setModel(model);
            product.setPrice(price);
            product.setDescription(description);
            product.setImageUrl(imageUrl);
            product.setCategory(category);
            product.setGender(gender);

            // Lưu sản phẩm để có ID
            Product savedProduct = productRepository.save(product);

            // Lưu variants
            if (variants != null) {
                List<ProductVariant> filteredVariants = variants.stream()
                        .filter(variant -> {
                            String sizeValue = variant.getSize() != null ? variant.getSize().getSize() : null;
                            String colorValue = variant.getColor() != null ? variant.getColor().getColor() : null;
                            boolean sizeValid = sizeValue == null || (gender == Product.Gender.tre_em ? KID_SIZES.contains(sizeValue) : ADULT_SIZES.contains(sizeValue));
                            boolean colorValid = colorValue != null;
                            return sizeValid && colorValid;
                        })
                        .map(variant -> {
                            ProductVariant entity = new ProductVariant();
                            entity.setId(variant.getId());
                            entity.setQuantity(variant.getQuantity());
                            entity.setProduct(savedProduct);

                            // Sử dụng findOrCreate để tránh lỗi duplicate
                            ProductSize size = productSizeService.findOrCreate(variant.getSize().getSize());
                            entity.setSize(size);

                            ProductColor color = productColorService.findOrCreate(variant.getColor().getColor());
                            entity.setColor(color);

                            return entity;
                        })
                        .collect(Collectors.toList());

                if (filteredVariants.isEmpty() && !variants.isEmpty()) {
                    logger.warning("All variants are invalid for gender: " + gender + ". No variants will be saved.");
                }

                filteredVariants.forEach(productVariantService::save);
                savedProduct.setVariants(filteredVariants);
            }

            // Lưu lại sản phẩm với variants đã set
            Product finalProduct = productRepository.save(savedProduct);
            return convertToProductDTO(finalProduct);

        } catch (Exception e) {
            logger.severe("Error creating product: " + e.getMessage());
            throw new RuntimeException("Failed to create product: " + e.getMessage());
        }
    }

    @Transactional
    public ProductDTO updateProductWithVariants(Long id, String name, String model, Double price, String description,
                                                String imageUrl, String category, Product.Gender gender,
                                                List<ProductSizeDTO> sizes, List<ProductColorDTO> colors,
                                                List<ProductVariantDTO> variants) {
        try {
            logger.info("Updating product with id: " + id);
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

            // Kiểm tra model mới có trùng không
            if (!product.getModel().equals(model) && productRepository.existsByModel(model)) {
                logger.warning("Model " + model + " already exists");
                throw new RuntimeException("Model " + model + " already exists");
            }

            // Cập nhật thông tin product
            product.setName(name);
            product.setModel(model);
            product.setPrice(price);
            product.setDescription(description);
            product.setImageUrl(imageUrl);
            product.setCategory(category);
            product.setGender(gender);

            // Lấy variants hiện tại của product
            List<ProductVariant> existingVariants = productVariantService.findByProduct(product);

            // Xử lý variants mới gửi lên
            for (ProductVariantDTO variantDTO : variants) {
                String sizeValue = variantDTO.getSize() != null ? variantDTO.getSize().getSize() : null;
                String colorValue = variantDTO.getColor() != null ? variantDTO.getColor().getColor() : null;

                boolean sizeValid = sizeValue == null || (gender == Product.Gender.tre_em ? KID_SIZES.contains(sizeValue) : ADULT_SIZES.contains(sizeValue));
                boolean colorValid = colorValue != null;

                if (!sizeValid || !colorValid) continue;

                // Tìm variant đã tồn tại với cùng size và color
                ProductVariant matchedVariant = existingVariants.stream()
                        .filter(ev -> ev.getSize().getSize().equals(sizeValue)
                                && ev.getColor().getColor().equals(colorValue))
                        .findFirst()
                        .orElse(null);

                // Lấy hoặc tạo size và color bằng findOrCreate
                ProductSize sizeEntity = productSizeService.findOrCreate(sizeValue);
                ProductColor colorEntity = productColorService.findOrCreate(colorValue);

                if (matchedVariant != null) {
                    // Cập nhật variant hiện có
                    matchedVariant.setQuantity(variantDTO.getQuantity());
                    matchedVariant.setSize(sizeEntity);
                    matchedVariant.setColor(colorEntity);

                    productVariantService.save(matchedVariant);

                    // Đã xử lý rồi, remove khỏi existingVariants để đánh dấu
                    existingVariants.remove(matchedVariant);
                } else {
                    // Tạo mới variant
                    ProductVariant newVariant = new ProductVariant();
                    newVariant.setQuantity(variantDTO.getQuantity());
                    newVariant.setSize(sizeEntity);
                    newVariant.setColor(colorEntity);
                    newVariant.setProduct(product);
                    productVariantService.save(newVariant);
                    product.getVariants().add(newVariant);
                }
            }

            // Xử lý các variant cũ không còn trong danh sách gửi lên (nếu cần)
            // Ví dụ: set quantity = 0 hoặc soft delete
            for (ProductVariant oldVariant : existingVariants) {
                // Ví dụ: oldVariant.setQuantity(0);
                // productVariantService.save(oldVariant);
            }

            Product finalProduct = productRepository.save(product);
            return convertToProductDTO(finalProduct);
        } catch (Exception e) {
            logger.severe("Error updating product: " + e.getMessage());
            throw new RuntimeException("Failed to update product: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        try {
            logger.info("Deleting product with id: " + id);
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
            productRepository.delete(product);
            logger.info("Deleted product with id: " + id);
        } catch (Exception e) {
            logger.severe("Error deleting product: " + e.getMessage());
            throw new RuntimeException("Failed to delete product: " + e.getMessage());
        }
    }

    private ProductDTO convertToProductDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setModel(product.getModel());
        productDTO.setPrice(product.getPrice());
        productDTO.setDescription(product.getDescription());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setCreatedAt(product.getCreatedAt());
        productDTO.setUpdatedAt(product.getUpdatedAt());
        productDTO.setCategory(product.getCategory());
        productDTO.setGender(product.getGender());

        // Lấy variants
        List<ProductVariantDTO> variantDTOs = productVariantService.getVariantsByProductId(product.getId());

        // Lấy sizes từ variants
        List<ProductSizeDTO> sizeDTOs = variantDTOs.stream()
                .map(ProductVariantDTO::getSize)
                .filter(sizeDTO -> {
                    String sizeValue = sizeDTO.getSize();
                    switch (product.getGender()) {
                        case tre_em:
                            return KID_SIZES.contains(sizeValue);
                        case nam:
                        case nu:
                            return ADULT_SIZES.contains(sizeValue);
                        default:
                            return false;
                    }
                })
                .distinct()
                .collect(Collectors.toList());

        // Lấy colors từ variants
        List<ProductColorDTO> colorDTOs = variantDTOs.stream()
                .map(ProductVariantDTO::getColor)
                .distinct()
                .collect(Collectors.toList());

        productDTO.setSizes(sizeDTOs);
        productDTO.setColors(colorDTOs);
        productDTO.setVariants(variantDTOs);
        return productDTO;
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategoryPaging(String categoryName, Product.Gender gender, Pageable pageable) {
        try {
            logger.info("Fetching paged products by category: " + categoryName + " and gender: " + gender);
            Page<Product> productPage;

            if (gender != null) {
                productPage = productRepository.findByCategoryNameAndGender(categoryName, gender, pageable);
            } else {
                productPage = productRepository.findByCategoryName(categoryName, pageable);
            }

            return productPage.map(this::convertToProductDTO);
        } catch (Exception e) {
            logger.severe("Error fetching paged products by category and gender: " + e.getMessage());
            throw new RuntimeException("Failed to fetch paged products by category and gender: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByAllWithPaging(Product.Gender gender, Pageable pageable) {
        try {
            logger.info("Fetching paged products for ALL categories with gender: " + gender);
            Page<Product> productPage;

            if (gender != null) {
                productPage = productRepository.findByGender(gender, pageable);
            } else {
                productPage = productRepository.findAll(pageable);
            }

            return productPage.map(this::convertToProductDTO);
        } catch (Exception e) {
            logger.severe("Error fetching all paged products: " + e.getMessage());
            throw new RuntimeException("Failed to fetch paged products: " + e.getMessage());
        }
    }
}