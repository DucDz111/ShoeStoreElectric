package org.example.shoestorebackend.admincontroller;

import org.example.shoestorebackend.dto.OrderDTO;
import org.example.shoestorebackend.dto.OrderItemDTO;
import org.example.shoestorebackend.dto.UserDTO;
import org.example.shoestorebackend.entity.Order;
import org.example.shoestorebackend.entity.OrderItem;
import org.example.shoestorebackend.entity.User;
import org.example.shoestorebackend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private static final Logger logger = Logger.getLogger(AdminOrderController.class.getName());

    @Autowired
    private OrderService orderService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderDTO> orderDTOs = orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orderDTOs);
    }

    // Hàm chuyển User -> UserDTO
    private UserDTO convertToUserDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    // Hàm chuyển OrderItem -> OrderItemDTO
    private OrderItemDTO convertToOrderItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setProductId(item.getProduct().getId());
        dto.setName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPriceAtTime());
        if (item.getVariant() != null) {
            dto.setColor(item.getVariant().getColor().getColor());
            dto.setSize(item.getVariant().getSize().getSize());
        }
        return dto;
    }

    // Hàm chuyển Order -> OrderDTO
    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUser(convertToUserDTO(order.getUser()));
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setDiscountCodeId(order.getDiscountCode() != null ? order.getDiscountCode().getId() : null);
        dto.setOrderNote(order.getOrderNote());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setOrderItems(order.getOrderItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            logger.info("Updating order status for order id: " + id);
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            Order.Status statusEnum = Order.Status.valueOf(newStatus.toUpperCase());
            Order updatedOrder = orderService.updateOrderForAdmin(id, statusEnum);

            logger.info("Updated order status to: " + newStatus);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            logger.severe("Invalid status value: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        } catch (RuntimeException e) {
            logger.severe("Error updating order status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
