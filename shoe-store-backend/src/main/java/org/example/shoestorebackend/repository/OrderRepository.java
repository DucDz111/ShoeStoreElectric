package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "orderItems.variant", "orderItems.variant.size", "orderItems.variant.color"})
    List<Order> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "orderItems.variant", "orderItems.variant.size", "orderItems.variant.color"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    @Query("SELECT o FROM Order o WHERE o.status = org.example.shoestorebackend.entity.Order.Status.DELIVERED AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findDeliveredOrdersByDate(LocalDateTime startDate, LocalDateTime endDate);
}
