package org.example.shoestorebackend.service;

import org.example.shoestorebackend.entity.*;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.shoestorebackend.repository.OrderItemRepository;
import org.example.shoestorebackend.repository.OrderRepository;
import org.example.shoestorebackend.repository.ProductRepository;
import org.example.shoestorebackend.repository.ProductVariantRepository;
import org.example.shoestorebackend.repository.UserRepository;
import org.example.shoestorebackend.repository.CartItemRepository; // Giả định có repository này

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private DiscountCodeService discountCodeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository; // Thêm dependency này

    @Transactional
    public Order createOrder(Long userId, List<CartItem> cartItems, Long discountCodeId, String orderNote, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + userId));

        // Kiểm tra số lượng tồn kho từ ProductVariant
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + cartItem.getProduct().getId()));
            ProductVariant variant = cartItem.getVariant();

            if (variant == null) {
                throw new RuntimeException("ProductVariant không tồn tại cho sản phẩm: " + product.getName());
            }

            int requestedQuantity = cartItem.getQuantity();

            // Kiểm tra số lượng tồn kho
            if (variant.getQuantity() < requestedQuantity) {
                throw new RuntimeException("Hết hàng: Sản phẩm " + product.getName() +
                        " với size " + variant.getSize().getSize() + " và color " + variant.getColor().getColor() +
                        " chỉ còn " + variant.getQuantity() + " sản phẩm.");
            }

            // Cập nhật số lượng tồn kho (sẽ cập nhật sau khi lưu order)
            variant.setQuantity(variant.getQuantity() - requestedQuantity);
        }

        double totalAmount = cartItems.stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setOrderNote(orderNote);
        order.setPaymentMethod(paymentMethod);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        double discountAmount = 0.0;
        if (discountCodeId != null) {
            DiscountCode discountCode = discountCodeService.getDiscountCodeById(discountCodeId);
            if (discountCode.getIsActive() && discountCode.getExpiryDate().isAfter(LocalDate.now())) {
                if (totalAmount >= discountCode.getMinOrderAmount()) {
                    discountAmount = totalAmount * discountCode.getDiscountPercentage() / 100;
                    if (discountCode.getMaxDiscountAmount() != null && discountAmount > discountCode.getMaxDiscountAmount()) {
                        discountAmount = discountCode.getMaxDiscountAmount();
                    }
                }
                order.setDiscountCode(discountCode);
                order.setDiscountAmount(discountAmount);
            }
        }

        order = orderRepository.save(order);

        // Lưu OrderItem và cập nhật ProductVariant
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProduct().getId()).get();
            ProductVariant variant = cartItem.getVariant();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setVariant(variant);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtTime(product.getPrice());
            orderItemRepository.save(orderItem);

            // Cập nhật và lưu lại variant
            variant.setQuantity(variant.getQuantity() - cartItem.getQuantity());
            productVariantRepository.save(variant);
        }

        // Xóa toàn bộ giỏ hàng của user sau khi đặt hàng thành công
        cartItemRepository.deleteByUserId(userId);

        return orderRepository.save(order);
    }
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();

        for (Order order : orders) {    
            Hibernate.initialize(order.getOrderItems());
            for (OrderItem item : order.getOrderItems()) {
                Hibernate.initialize(item.getProduct());
                Hibernate.initialize(item.getVariant());
                if (item.getVariant() != null) {
                    Hibernate.initialize(item.getVariant().getSize());
                    Hibernate.initialize(item.getVariant().getColor());
                }
            }
        }

        return orders;
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        // Tải đầy đủ dữ liệu lazy-loaded
        for (Order order : orders) {
            Hibernate.initialize(order.getOrderItems());
            for (OrderItem item : order.getOrderItems()) {
                Hibernate.initialize(item.getProduct());
                Hibernate.initialize(item.getVariant());
                if (item.getVariant() != null) {
                    Hibernate.initialize(item.getVariant().getSize());
                    Hibernate.initialize(item.getVariant().getColor());
                }
            }
        }

        return orders;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.Status status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + orderId));

        if (status == Order.Status.CANCELLED && (order.getStatus() == Order.Status.DELIVERED || order.getStatus() == Order.Status.CANCELLED)) {
            throw new RuntimeException("Không thể hủy đơn hàng đã giao hoặc đã hủy");
        }

        // Hoàn lại số lượng tồn kho nếu hủy đơn
        if (status == Order.Status.CANCELLED && (order.getStatus() == Order.Status.PENDING || order.getStatus() == Order.Status.PROCESSING)) {
            for (OrderItem item : order.getOrderItems()) {
                ProductVariant variant = item.getVariant();
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderByIdAndUserId(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + orderId));

        // Eager loading tất cả dữ liệu liên quan để tránh lazy loading sau này
        Hibernate.initialize(order.getOrderItems());
        for (OrderItem item : order.getOrderItems()) {
            Hibernate.initialize(item.getProduct());
            Hibernate.initialize(item.getVariant());
            if (item.getVariant() != null) {
                Hibernate.initialize(item.getVariant().getSize());
                Hibernate.initialize(item.getVariant().getColor());
            }
        }

        return order;
    }
    @Transactional
    public Order updateOrderForAdmin(Long orderId, Order.Status status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + orderId));

        Order.Status currentStatus = order.getStatus();
        switch (status) {
            case PROCESSING:
                if (currentStatus != Order.Status.PENDING) {
                    throw new RuntimeException("Chỉ có thể chấp nhận từ trạng thái PENDING");
                }
                break;
            case CANCELLED:
                if (currentStatus == Order.Status.DELIVERED) {
                    throw new RuntimeException("Không thể hủy đơn hàng đã giao");
                }
                break;
            case SHIPPING:
                if (currentStatus != Order.Status.PROCESSING) {
                    throw new RuntimeException("Chỉ có thể chuyển sang SHIPPING từ PROCESSING");
                }
                break;
            case DELIVERED:
                if (currentStatus != Order.Status.SHIPPING) {
                    throw new RuntimeException("Chỉ có thể chuyển sang DELIVERED từ SHIPPING");
                }
                break;
        }

        if (status == Order.Status.CANCELLED && (currentStatus == Order.Status.PENDING || currentStatus == Order.Status.PROCESSING)) {
            for (OrderItem item : order.getOrderItems()) {
                ProductVariant variant = item.getVariant();
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
    @Transactional(readOnly = true)
    public Optional<Order> getOrderByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + orderId));

        // Tải đầy đủ dữ liệu lazy-loaded
        Hibernate.initialize(order.getOrderItems());
        for (OrderItem item : order.getOrderItems()) {
            Hibernate.initialize(item.getProduct());
            Hibernate.initialize(item.getVariant());
            if (item.getVariant() != null) {
                Hibernate.initialize(item.getVariant().getSize());
                Hibernate.initialize(item.getVariant().getColor());
            }
        }

        return Optional.of(order);
    }
}