package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.dto.OrderDTO;
import org.example.shoestorebackend.dto.OrderItemDTO;
import org.example.shoestorebackend.dto.UserDTO;
import org.example.shoestorebackend.entity.*;
import org.example.shoestorebackend.repository.ProductVariantRepository;
import org.example.shoestorebackend.service.OrderService;
import org.example.shoestorebackend.util.JwtUtil;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request, Authentication authentication, HttpServletRequest httpRequest) {
        try {
            // Kiểm tra xác thực
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Please log in to access this resource\"}");
            }

            // Lấy userId từ token
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Token không hợp lệ\"}");
            }
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);

            // Kiểm tra cartItems
            Object cartItemsObj = request.get("cartItems");
            if (cartItemsObj == null) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"cartItems không được để trống\"}");
            }
            List<Map<String, Object>> cartItemsData = (List<Map<String, Object>>) cartItemsObj;

            // Kiểm tra các trường khác
            Object discountCodeIdObj = request.get("discountCodeId");
            Long discountCodeId = discountCodeIdObj != null ? Long.valueOf(discountCodeIdObj.toString()) : null;

            Object orderNoteObj = request.get("orderNote");
            String orderNote = orderNoteObj != null ? orderNoteObj.toString() : "";

            Object paymentMethodObj = request.get("paymentMethod");
            String paymentMethod = paymentMethodObj != null ? paymentMethodObj.toString() : "COD"; // Mặc định là COD nếu không có

            // Chuyển đổi cartItemsData thành List<CartItem>
            List<CartItem> cartItems = cartItemsData.stream().map(item -> {
                CartItem cartItem = new CartItem();

                Object idObj = item.get("id");
                if (idObj == null) {
                    throw new RuntimeException("id của cartItem không được để trống");
                }
                long cartItemId;
                try {
                    if (idObj instanceof Number) {
                        cartItemId = ((Number) idObj).longValue(); // Nếu là số, chuyển thẳng
                    } else {
                        cartItemId = Double.valueOf(idObj.toString()).longValue(); // Nếu là chuỗi có E12
                    }
                } catch (NumberFormatException e) {
                    throw new RuntimeException("id của cartItem không hợp lệ: " + idObj);
                }
                cartItem.setId(cartItemId);

                cartItem.setUser(new User());
                cartItem.getUser().setId(userId);

                cartItem.setProduct(new Product());
                Object productIdObj = item.get("productId");
                if (productIdObj == null) {
                    throw new RuntimeException("productId của cartItem không được để trống");
                }
                Long productId = Long.valueOf(productIdObj.toString());
                cartItem.getProduct().setId(productId);

                Object priceObj = item.get("price");
                if (priceObj == null) {
                    throw new RuntimeException("price của cartItem không được để trống");
                }
                cartItem.getProduct().setPrice(Double.valueOf(priceObj.toString()));

                Object sizeObj = item.get("size");
                if (sizeObj == null) {
                    throw new RuntimeException("size của cartItem không được để trống");
                }
                String size = sizeObj.toString();

                Object colorObj = item.get("color");
                if (colorObj == null) {
                    throw new RuntimeException("color của cartItem không được để trống");
                }
                String color = colorObj.toString();

                // Tìm ProductVariant
                ProductVariant variant = productVariantRepository.findByProductIdAndSizeSizeAndColorColor(
                                productId, size, color)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy variant cho sản phẩm: " + productId +
                                ", size: " + size + ", color: " + color));
                cartItem.setVariant(variant);

                Object quantityObj = item.get("quantity");
                if (quantityObj == null) {
                    throw new RuntimeException("quantity của cartItem không được để trống");
                }
                cartItem.setQuantity(Integer.valueOf(quantityObj.toString()));

                return cartItem;
            }).toList();

            Order order = orderService.createOrder(userId, cartItems, discountCodeId, orderNote, paymentMethod);

            // Chuyển đổi Order thành OrderDTO
            OrderDTO orderDTO = convertToOrderDTO(order);
            return ResponseEntity.ok(orderDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Internal Server Error\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrdersByUser(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Token không hợp lệ\"}");
            }

            String token = authorizationHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);

            List<Order> orders = orderService.getOrdersByUserId(userId);
            List<OrderDTO> orderDTOs = orders.stream().map(this::convertToOrderDTO).collect(Collectors.toList());
            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Internal Server Error\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{orderId}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> request, Authentication authentication, HttpServletRequest httpRequest) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Please log in to access this resource\"}");
            }
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("{\"error\": \"Unauthorized\", \"message\": \"Token không hợp lệ\"}");
            }

            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractUserId(token);
            String statusStr = request.get("status");
            if (statusStr == null) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Trạng thái không được để trống\"}");
            }

            System.out.println("Request to update order " + orderId + " to status: " + statusStr + " by user: " + userId); // Log debug
            Order.Status status = Order.Status.valueOf(statusStr.toUpperCase());
            Order order = orderService.getOrderByIdAndUserId(orderId, userId); // Kiểm tra quyền sở hữu

            // Kiểm tra trạng thái hợp lệ để hủy
            if (order.getStatus() == Order.Status.DELIVERED || order.getStatus() == Order.Status.CANCELLED || order.getStatus() == Order.Status.SHIPPING) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Không thể hủy đơn hàng ở trạng thái hiện tại\"}");
            }

            if (status != Order.Status.CANCELLED) {
                return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Chỉ được phép hủy đơn hàng (CANCELLED)\"}");
            }

            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            OrderDTO orderDTO = convertToOrderDTO(updatedOrder);
            return ResponseEntity.ok(orderDTO);
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid status error: " + e.getMessage()); // Log debug
            return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"Trạng thái không hợp lệ: " + request.get("status") + "\"}");
        } catch (RuntimeException e) {
            System.out.println("Runtime error: " + e.getMessage()); // Log debug
            return ResponseEntity.status(400).body("{\"error\": \"Bad Request\", \"message\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            System.out.println("Internal server error: " + e.getMessage()); // Log debug
            return ResponseEntity.status(500).body("{\"error\": \"Internal Server Error\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }
    // Phương thức chuyển đổi Order thành OrderDTO
    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());

        // Chuyển đổi User thành UserDTO
        UserDTO userDTO = new UserDTO();
        userDTO.setId(order.getUser().getId());
        userDTO.setFirstName(order.getUser().getFirstName());
        userDTO.setLastName(order.getUser().getLastName());
        userDTO.setPhone(order.getUser().getPhone());
        userDTO.setEmail(order.getUser().getEmail());
        userDTO.setAddress(order.getUser().getAddress());
        userDTO.setCreatedAt(order.getUser().getCreatedAt());
        userDTO.setUpdatedAt(order.getUser().getUpdatedAt());
        orderDTO.setUser(userDTO);

        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setDiscountCodeId(order.getDiscountCode() != null ? order.getDiscountCode().getId() : null);
        orderDTO.setDiscountAmount(order.getDiscountAmount());
        orderDTO.setOrderNote(order.getOrderNote());
        orderDTO.setPaymentMethod(order.getPaymentMethod());
        orderDTO.setStatus(order.getStatus().toString());
        orderDTO.setCreatedAt(order.getCreatedAt());
        orderDTO.setUpdatedAt(order.getUpdatedAt());

        // Chuyển đổi danh sách OrderItem thành OrderItemDTO với name và model
        if (order.getOrderItems() != null) {
            List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setName(item.getProduct().getName()); // Sử dụng trường mới
                itemDTO.setModel(item.getProduct().getModel()); // Sử dụng trường mới
                itemDTO.setPrice(item.getPriceAtTime());
                if (item.getVariant() != null) {
                    itemDTO.setSize(item.getVariant().getSize().getSize());
                    itemDTO.setColor(item.getVariant().getColor().getColor());
                }
                itemDTO.setQuantity(item.getQuantity());
                return itemDTO;
            }).collect(Collectors.toList());
            orderDTO.setOrderItems(orderItemDTOs);
        }

        return orderDTO;
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrderById(@PathVariable Long id, @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String token = authorizationHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);
            Order order = orderService.getOrderByIdAndUserId(id, userId);
            OrderDTO orderDTO = convertToOrderDTO(order);
            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Internal Server Error\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }
}