package org.example.tkinopoisk.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final MutationAuditInterceptor mutationAuditInterceptor;

    public WebConfig(MutationAuditInterceptor mutationAuditInterceptor) {
        this.mutationAuditInterceptor = mutationAuditInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(mutationAuditInterceptor);
    }
}
