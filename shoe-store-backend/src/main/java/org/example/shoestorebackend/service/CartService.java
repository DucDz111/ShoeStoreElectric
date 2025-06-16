package org.example.shoestorebackend.service;

import org.example.shoestorebackend.dto.CartItemDTO;
import org.example.shoestorebackend.dto.CartItemResponseDTO;
import org.example.shoestorebackend.entity.CartItem;
import org.example.shoestorebackend.entity.Product;
import org.example.shoestorebackend.entity.ProductVariant;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.repository.CartItemRepository;
import org.example.shoestorebackend.repository.ProductRepository;
import org.example.shoestorebackend.repository.ProductVariantRepository;
import org.example.shoestorebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class CartService {

    private static final Logger logger = Logger.getLogger(CartService.class.getName());

    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CartItem> getCartItems(Long userId) {
        logger.info("Fetching cart items for user: " + userId);
        return cartItemRepository.findByUserId(userId);
    }

    @Transactional
    public CartItem addToCart(CartItem cartItem) {
        if (cartItem.getUser() == null || cartItem.getProduct() == null ||
                cartItem.getVariant() == null || cartItem.getQuantity() == null || cartItem.getQuantity() <= 0) {
            logger.severe("Required fields are missing or invalid in CartItem: " + cartItem);
            throw new IllegalArgumentException("Required fields are missing or invalid in CartItem");
        }

        Long userId = cartItem.getUser().getId();
        Long productId = cartItem.getProduct().getId();
        Long variantId = cartItem.getVariant().getId();

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductIdAndVariantId(
                userId, productId, variantId);

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int oldQuantity = existingItem.getQuantity();
            int addedQuantity = cartItem.getQuantity();
            existingItem.setQuantity(oldQuantity + addedQuantity); // Cộng dồn số lượng
            logger.info("Updating existing cart item: ID = " + existingItem.getId() +
                    ", old quantity = " + oldQuantity +
                    ", added quantity = " + addedQuantity +
                    ", new quantity = " + existingItem.getQuantity());
            return cartItemRepository.save(existingItem);
        } else {
            logger.info("Adding new cart item: " + cartItem);
            return cartItemRepository.save(cartItem);
        }
    }
    @Transactional
    public void mergeCart(Long userId, List<CartItemDTO> localCartItems) {
        logger.info("Merging cart for userId=" + userId + ", items count=" + (localCartItems == null ? 0 : localCartItems.size()));

        if (localCartItems == null || localCartItems.isEmpty()) {
            logger.info("No items to merge");
            return;
        }

        for (CartItemDTO dto : localCartItems) {
            logger.info("Merging CartItemDTO: productId=" + (dto.getProduct() != null ? dto.getProduct().getId() : "null") +
                    ", size=" + dto.getSize() + ", color=" + dto.getColor() + ", quantity=" + dto.getQuantity());
            try {
                if (dto.getProduct() == null || dto.getProduct().getId() == null ||
                        dto.getSize() == null || dto.getColor() == null ||
                        dto.getQuantity() == null || dto.getQuantity() <= 0) {
                    logger.warning("Skipping invalid CartItemDTO during merge: " + dto);
                    continue;
                }

                Long productId;
                try {
                    productId = Long.parseLong(dto.getProduct().getId());
                } catch (NumberFormatException e) {
                    logger.warning("Invalid product ID format in CartItemDTO: " + dto.getProduct().getId());
                    continue;
                }

                ProductVariant variant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                                productId, dto.getSize(), dto.getColor())
                        .orElse(null);
                if (variant == null) {
                    logger.warning("Variant not found for productId=" + productId + ", size=" + dto.getSize() + ", color=" + dto.getColor());
                    continue;
                }

                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

                CartItem cartItem = new CartItem();
                cartItem.setUser(user);
                cartItem.setProduct(product);
                cartItem.setVariant(variant);
                cartItem.setQuantity(dto.getQuantity());

                addToCart(cartItem);
            } catch (Exception e) {
                logger.severe("Error processing CartItemDTO: " + dto + ", error: " + e.getMessage());
                e.printStackTrace();
                throw e;  // Để lỗi được propagate lên và transaction rollback, hoặc bạn xử lý theo cách khác
            }
        }
    }



    @Transactional
    public CartItem updateQuantity(Long id, Integer quantity) {
        logger.info("Updating quantity for cart item ID: " + id + ", new quantity: " + quantity);
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + id));
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void deleteCartItem(Long id) {
        logger.info("Deleting cart item with ID: " + id);
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + id));
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        logger.info("Clearing cart for user: " + userId);
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        cartItemRepository.deleteAll(cartItems);
    }

    @Transactional(readOnly = true)
    public List<CartItemResponseDTO> getCartItemResponseDTOs(Long userId) {
        logger.info("Converting cart items to DTOs for user: " + userId);
        return getCartItems(userId).stream()
                .map(this::mapToCartItemResponseDTO)
                .collect(Collectors.toList());
    }

    private CartItemResponseDTO mapToCartItemResponseDTO(CartItem cartItem) {
        CartItemResponseDTO responseDTO = new CartItemResponseDTO();
        responseDTO.setId(cartItem.getId());
        responseDTO.setQuantity(cartItem.getQuantity());

        CartItemResponseDTO.UserDTO userDTO = new CartItemResponseDTO.UserDTO();
        userDTO.setId(cartItem.getUser().getId());
        userDTO.setEmail(cartItem.getUser().getEmail());
        userDTO.setFirstName(cartItem.getUser().getFirstName());
        userDTO.setLastName(cartItem.getUser().getLastName());
        userDTO.setPhone(cartItem.getUser().getPhone());
        responseDTO.setUser(userDTO);

        CartItemResponseDTO.ProductDTO productDTO = new CartItemResponseDTO.ProductDTO();
        Product product = cartItem.getProduct();
        productDTO.setId(String.valueOf(product.getId()));
        productDTO.setName(product.getName());
        productDTO.setPrice(product.getPrice());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setCategory(product.getCategory());
        productDTO.setGender(product.getGender());

        // Lấy danh sách sizes và colors từ ProductVariant
        List<String> sizes = productVariantRepository.findByProductId(product.getId())
                .stream()
                .map(variant -> variant.getSize().getSize())
                .distinct()
                .collect(Collectors.toList());
        List<String> colors = productVariantRepository.findByProductId(product.getId())
                .stream()
                .map(variant -> variant.getColor().getColor())
                .distinct()
                .collect(Collectors.toList());

        productDTO.setSizes(sizes);
        productDTO.setColors(colors);
        responseDTO.setProduct(productDTO);

        if (cartItem.getVariant() != null) {
            responseDTO.setSize(cartItem.getVariant().getSize().getSize());
            responseDTO.setColor(cartItem.getVariant().getColor().getColor());
        }

        return responseDTO;
    }
    @Transactional
    public CartItem saveCartItem(CartItem cartItem) {
        return cartItemRepository.save(cartItem);
    }
}