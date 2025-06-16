package service;

import org.example.shoestorebackend.dto.RegisterRequest;
import org.example.shoestorebackend.entity.User;
import jakarta.transaction.Transactional;
import org.example.shoestorebackend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.example.shoestorebackend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = org.example.shoestorebackend.ShoeStoreBackendApplication.class) // Chỉ định lớp chính
@Transactional // Rollback để không lưu dữ liệu rác
public class AuthServiceIntegrationTest {
    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    private RegisterRequest request;

    @BeforeEach
    void setUp() {
        // Dữ liệu hợp lệ theo RegisterRequest
        request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("1234567890");
        request.setEmail("john.doe@example.com");
        request.setPassword("password123");


    }

    @Test
    void testRegisterSuccess() {
        // Act
        User result = authService.register(request);

        // Assert: Kiểm tra kết quả trả về
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("1234567890", result.getPhone());
        assertEquals("john.doe@example.com", result.getEmail());
        assertNotEquals("password123", result.getPassword());
        assertTrue(result.getPassword().startsWith("$2a$"));
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());

        // Kiểm tra database
//        User savedUser = userRepository.findByEmail("john.doe@example.com");
//        assertNotNull(savedUser);
//        assertEquals("John", savedUser.getFirstName());
//        assertEquals("Doe", savedUser.getLastName());
//        assertEquals("1234567890", savedUser.getPhone());
//        assertEquals("john.doe@example.com", savedUser.getEmail());
//        assertNotEquals("password123", savedUser.getPassword());
//        assertTrue(savedUser.getPassword().startsWith("$2a$"));
//        assertNotNull(savedUser.getCreatedAt());
//        assertNotNull(savedUser.getUpdatedAt());
    }

    @Test
    void testRegisterEmailAlreadyExists() {
        // Arrange
        User existingUser = new User();
        existingUser.setFirstName("Jane");
        existingUser.setLastName("Doe");
        existingUser.setPhone("0987654321");
        existingUser.setEmail("john.doe@example.com");
        existingUser.setPassword("encodedPassword");
        existingUser.setCreatedAt(java.time.LocalDateTime.now());
        existingUser.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(existingUser);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterPhoneAlreadyExists() {
        // Arrange
        User existingUser = new User();
        existingUser.setFirstName("Jane");
        existingUser.setLastName("Doe");
        existingUser.setPhone("1234567890");
        existingUser.setEmail("jane.doe@example.com");
        existingUser.setPassword("encodedPassword");
        existingUser.setCreatedAt(java.time.LocalDateTime.now());
        existingUser.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(existingUser);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.register(request));
    }
}
