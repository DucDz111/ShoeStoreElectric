package org.example.shoestorebackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ánh xạ URL /images/** tới thư mục thực tế trên ổ đĩa
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///D:/shoe-images/");
    }
}
