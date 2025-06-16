package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.dto.CartItemDTO;
import org.example.shoestorebackend.dto.CartItemQuantityDTO;
import org.example.shoestorebackend.dto.CartItemResponseDTO;
import org.example.shoestorebackend.entity.CartItem;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.entity.ProductVariant;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.repository.ProductRepository;
import org.example.shoestorebackend.repository.ProductVariantRepository;
import org.example.shoestorebackend.repository.UserRepository;
import org.example.shoestorebackend.security.CustomUserDetails;
import org.example.shoestorebackend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger logger = Logger.getLogger(CartController.class.getName());

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @GetMapping
    public ResponseEntity<?> getCartItems(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();
        logger.info("Fetching cart items for user: " + userId);

        try {
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (Exception e) {
            logger.severe("Error fetching cart items: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @Transactional
    @PostMapping
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemDTO cartItemDTO) {
        if (userDetails == null) {
            logger.severe("User not authenticated");
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();
        logger.info("Adding to cart for user: " + userId);

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            logger.info("Found user: " + user.getId());

            String productIdStr = cartItemDTO.getProduct().getId();
            if (productIdStr == null || !productIdStr.matches("\\d+")) {
                logger.severe("Invalid product ID: " + productIdStr);
                return ResponseEntity.badRequest().body("Invalid product ID: " + productIdStr);
            }
            Long productId = Long.parseLong(productIdStr);
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
            logger.info("Found product: " + product.getId());

            if (cartItemDTO.getSize() == null || cartItemDTO.getColor() == null ||
                    cartItemDTO.getQuantity() == null || cartItemDTO.getQuantity() <= 0) {
                logger.severe("Missing or invalid required fields: size, color, or quantity");
                return ResponseEntity.badRequest().body("Missing or invalid required fields: size, color, or quantity");
            }

            ProductVariant variant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                            productId, cartItemDTO.getSize(), cartItemDTO.getColor())
                    .orElseThrow(() -> new RuntimeException("Variant not found for product: " + productId +
                            ", size: " + cartItemDTO.getSize() + ", color: " + cartItemDTO.getColor()));
            logger.info("Found variant: " + variant.getId());

            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setVariant(variant);
            cartItem.setQuantity(cartItemDTO.getQuantity());

            logger.info("CartItem to add: id=" + (cartItem.getId() != null ? cartItem.getId() : "null") +
                    ", productId=" + cartItem.getProduct().getId() + ", quantity=" + cartItem.getQuantity());

            CartItem savedCartItem = cartService.addToCart(cartItem);
            logger.info("Cart item saved: " + savedCartItem);
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (IllegalArgumentException e) {
            logger.severe("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Error adding to cart: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    @Transactional
    @PostMapping("/merge")
    public ResponseEntity<?> mergeCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<CartItemDTO> localCartItems) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            cartService.mergeCart(userId, localCartItems);
            // Trả về giỏ hàng sau khi merge
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (Exception e) {
            logger.severe("Error merging cart: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }


    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody CartItem cartItem) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            CartItem updatedItem = cartService.updateQuantity(id, cartItem.getQuantity());
            logger.info("Updated cart item: " + updatedItem);
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (IllegalArgumentException e) {
            logger.severe("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Error updating quantity: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @PutMapping("/{productId}/{size}/{color}")
    public ResponseEntity<?> updateQuantityByProductAndVariant(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @PathVariable String size,
            @PathVariable String color,
            @RequestBody CartItemQuantityDTO quantityDTO) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            ProductVariant variant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                            productId, size, color)
                    .orElseThrow(() -> new RuntimeException("Variant not found for product: " + productId +
                            ", size: " + size + ", color: " + color));

            CartItem existingItem = cartService.getCartItems(userId).stream()
                    .filter(item -> item.getProduct().getId().equals(productId) &&
                            item.getVariant().getId().equals(variant.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Cart item not found for product: " + productId + ", variant: " + variant.getId()));

            if (quantityDTO.getQuantity() == null || quantityDTO.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body("Invalid quantity: must be greater than 0");
            }

            cartService.updateQuantity(existingItem.getId(), quantityDTO.getQuantity());
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (Exception e) {
            logger.severe("Error updating quantity by product and variant: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }


//    @Transactional
//    @PutMapping("/{productId}/{size}/{color}/quantity")
//    public ResponseEntity<?> updateQuantityOnly(
//            @AuthenticationPrincipal UserDetails userDetails,
//            @PathVariable Long productId,
//            @PathVariable String size,
//            @PathVariable String color,
//            @RequestBody CartItemQuantityDTO quantityDTO) {
//        if (userDetails == null) {
//            return ResponseEntity.status(401).body("User not authenticated");
//        }
//        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
//        Long userId = customUserDetails.getId();
//
//        try {
//            ProductVariant variant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
//                            productId, size, color)
//                    .orElseThrow(() -> new RuntimeException("Variant not found for product: " + productId +
//                            ", size: " + size + ", color: " + color));
//
//            CartItem existingItem = cartService.getCartItems(userId).stream()
//                    .filter(item -> item.getProduct().getId().equals(productId) &&
//                            item.getVariant().getId().equals(variant.getId()))
//                    .findFirst()
//                    .orElseThrow(() -> new RuntimeException("Cart item not found for product: " + productId + ", variant: " + variant.getId()));
//
//            if (quantityDTO.getQuantity() == null || quantityDTO.getQuantity() <= 0) {
//                return ResponseEntity.badRequest().body("Invalid quantity: must be greater than 0");
//            }
//
//            cartService.updateQuantity(existingItem.getId(), quantityDTO.getQuantity());
//            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
//        } catch (Exception e) {
//            logger.severe("Error updating quantity: " + e.getMessage());
//            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
//        }
//    }


    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            cartService.deleteCartItem(id);
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (Exception e) {
            logger.severe("Error deleting cart item: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    @Transactional
    @PutMapping("/{productId}/{size}/{color}/update")
    public ResponseEntity<?> updateCartItemDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @PathVariable String size,
            @PathVariable String color,
            @RequestBody CartItemDTO updatedItem) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            ProductVariant oldVariant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                            productId, size, color)
                    .orElseThrow(() -> new RuntimeException("Old variant not found"));

            CartItem existingItem = cartService.getCartItems(userId).stream()
                    .filter(item -> item.getProduct().getId().equals(productId) &&
                            item.getVariant().getId().equals(oldVariant.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Cart item not found"));

            // Kiểm tra variant mới
            ProductVariant newVariant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                            productId, updatedItem.getSize(), updatedItem.getColor())
                    .orElseThrow(() -> new RuntimeException("New variant not found"));

            existingItem.setVariant(newVariant);
            cartService.saveCartItem(existingItem); // Lưu thay đổi

            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (Exception e) {
            logger.severe("Error updating cart item details: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @Transactional
    @DeleteMapping("/{productId}/{size}/{color}")
    public ResponseEntity<?> deleteCartItemByProductAndVariant(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @PathVariable String size,
            @PathVariable String color) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            ProductVariant variant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                            productId, size, color)
                    .orElseThrow(() -> new RuntimeException("Variant not found for product: " + productId +
                            ", size: " + size + ", color: " + color));

            CartItem existingItem = cartService.getCartItems(userId).stream()
                    .filter(item -> item.getProduct().getId().equals(productId) &&
                            item.getVariant().getId().equals(variant.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Cart item not found for product: " + productId + ", variant: " + variant.getId()));

            cartService.deleteCartItem(existingItem.getId());
            return ResponseEntity.ok(cartService.getCartItemResponseDTOs(userId));
        } catch (Exception e) {
            logger.severe("Error deleting cart item by product and variant: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @Transactional
    @DeleteMapping
    public ResponseEntity<?> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        Long userId = customUserDetails.getId();

        try {
            cartService.clearCart(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.severe("Error clearing cart: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
}