package org.example.shoestorebackend.service;

import org.example.shoestorebackend.entity.DiscountCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.example.shoestorebackend.repository.DiscountCodeRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class DiscountCodeService {
    @Autowired
    private DiscountCodeRepository discountCodeRepository;
    public List<DiscountCode> getActiveDiscountCodes() {
        return discountCodeRepository.findByIsActiveTrue().stream()
                .filter(dc -> dc.getExpiryDate().isAfter(LocalDate.now()))
                .toList();
    }

    public DiscountCode getDiscountCodeById(Long id) {
        return discountCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount code not found with id: " + id));
    }
}
