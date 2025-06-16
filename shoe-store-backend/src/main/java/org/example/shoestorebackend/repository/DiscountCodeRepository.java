package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {
    List<DiscountCode> findByIsActiveTrue();
}
