package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.shoestorebackend.dto.RegisterRequest;
import org.example.shoestorebackend.ShoeStoreBackendApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.example.shoestorebackend.repository.UserRepository;
import org.example.shoestorebackend.service.AuthService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = ShoeStoreBackendApplication.class)
@AutoConfigureMockMvc
@Transactional // Quan trọng: đảm bảo rollback database sau mỗi test
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        userRepository.deleteAll(); // Clear database trước mỗi test
    }

    @Test
    public void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("1234567890");
        request.setEmail("john.doe@example.com");
        request.setPassword("password123");

        String requestJson = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    public void testRegisterEmailAlreadyExists() throws Exception {
        RegisterRequest firstRequest = new RegisterRequest();
        firstRequest.setFirstName("John");
        firstRequest.setLastName("Doe");
        firstRequest.setPhone("1234567890");
        firstRequest.setEmail("john.doe@example.com");
        firstRequest.setPassword("password123");
        authService.register(firstRequest);

        RegisterRequest secondRequest = new RegisterRequest();
        secondRequest.setFirstName("Jane");
        secondRequest.setLastName("Doe");
        secondRequest.setPhone("0987654321");
        secondRequest.setEmail("john.doe@example.com");
        secondRequest.setPassword("password456");

        String requestJson = objectMapper.writeValueAsString(secondRequest);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$").value("Email already exists"));
    }

    @Test
    public void testRegisterInvalidData() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("");
        request.setLastName("Doe");
        request.setPhone("123");
        request.setEmail("invalid-email");
        request.setPassword("123");

        String requestJson = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.firstName").value("First name is required"))
                .andExpect(jsonPath("$.phone").value("Phone number must be between 10 and 15 characters"))
                .andExpect(jsonPath("$.email").value("Email should be valid"))
                .andExpect(jsonPath("$.password").value("Password must be at least 6 characters"));
    }
}
