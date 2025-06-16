package org.example.shoestorebackend.repository;

import org.example.shoestorebackend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query("SELECT p FROM Product p WHERE LOWER(p.category) = LOWER(:categoryName)")
    Page<Product> findByCategoryName(@Param("categoryName") String categoryName, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.category) = LOWER(:categoryName) AND p.gender = :gender")
    Page<Product> findByCategoryNameAndGender(@Param("categoryName") String categoryName, @Param("gender") Product.Gender gender, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.gender = :gender")
    Page<Product> findByGender(@Param("gender") Product.Gender gender, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    boolean existsByModel(String model);

    @EntityGraph(attributePaths = {"variants"})
    Optional<Product> findById(Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.variants WHERE p.id = :id")
    Optional<Product> findByIdWithVariants(@Param("id") Long id);
}
