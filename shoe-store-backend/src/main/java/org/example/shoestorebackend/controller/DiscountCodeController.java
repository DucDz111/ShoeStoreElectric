package org.example.shoestorebackend.controller;

import org.example.shoestorebackend.entity.DiscountCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.shoestorebackend.service.DiscountCodeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discount-codes")
public class DiscountCodeController {
    @Autowired
    private DiscountCodeService discountCodeService;
    @GetMapping
    public List<DiscountCode> getActiveDiscountCodes() {
        return discountCodeService.getActiveDiscountCodes();
    }
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Double>> applyDiscountCode(@RequestBody Map<String, Object> request) {
        Long discountCodeId = Long.valueOf(request.get("discountCodeId").toString());
        Double totalAmount = Double.valueOf(request.get("totalAmount").toString());

        DiscountCode discountCode = discountCodeService.getDiscountCodeById(discountCodeId);
        double discountAmount = 0.0;
        if (totalAmount >= discountCode.getMinOrderAmount()) {
            discountAmount = totalAmount * discountCode.getDiscountPercentage() / 100;
            if (discountCode.getMaxDiscountAmount() != null && discountAmount > discountCode.getMaxDiscountAmount()) {
                discountAmount = discountCode.getMaxDiscountAmount();
            }
        }

        return ResponseEntity.ok(Map.of("discountAmount", discountAmount));
    }
}
