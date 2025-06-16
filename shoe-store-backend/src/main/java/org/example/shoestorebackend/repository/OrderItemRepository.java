package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.Order;
import org.example.shoestorebackend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
