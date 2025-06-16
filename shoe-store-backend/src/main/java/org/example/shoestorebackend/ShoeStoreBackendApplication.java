package org.example.shoestorebackend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@SpringBootApplication
@ComponentScan(basePackages = {"org.example.shoestorebackend", "org.example.shoestorebackend.admincontroller"})
public class ShoeStoreBackendApplication {
    private static final Logger logger = LoggerFactory.getLogger(ShoeStoreBackendApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ShoeStoreBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner testDatabaseConnection(DataSource dataSource) {
        return args -> {
            logger.info("Testing database connection...");
            if (dataSource instanceof DriverManagerDataSource) {
                DriverManagerDataSource driverManagerDataSource = (DriverManagerDataSource) dataSource;
                logger.info("Database URL: {}", driverManagerDataSource.getUrl());
                logger.info("Database Username: {}", driverManagerDataSource.getUsername());
                // Không có cách trực tiếp để lấy password từ DataSource vì lý do bảo mật
            } else {
                logger.info("DataSource is not an instance of DriverManagerDataSource");
            }

            try (var connection = dataSource.getConnection()) {
                logger.info("Successfully connected to MySQL database!");
                logger.info("Database URL from Connection: {}", connection.getMetaData().getURL());
                logger.info("Database User from Connection: {}", connection.getMetaData().getUserName());
            } catch (Exception e) {
                logger.error("Failed to connect to MySQL database: {}", e.getMessage());
                throw new RuntimeException("Database connection failed", e);
            }
        };
    }
}