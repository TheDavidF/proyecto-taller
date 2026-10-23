package com.proyecto.taller.config;

import java.io.IOException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import com.proyecto.taller.service.AccesoService;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
public class SeguridadConfig {
    @Bean
    SecurityFilterChain seguridad(HttpSecurity http, AccesoService acceso) throws Exception {
        http.cors(cors -> {}).authorizeHttpRequests(reglas -> reglas
            .requestMatchers(HttpMethod.GET, "/", "/index.html", "/assets/**", "/favicon.ico", "/vite.svg",
                "/perfiles", "/usuarios", "/vehiculos", "/servicios", "/ordenes", "/reportes", "/api/health").permitAll()
            .requestMatchers("/api/auth/csrf", "/api/auth/login", "/error").permitAll()
            .requestMatchers("/api/auth/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/usuarios", "/api/usuarios/**", "/api/perfiles", "/api/perfiles/**").hasAnyRole("ADMIN", "EMPLEADO")
            .requestMatchers("/api/usuarios", "/api/usuarios/**", "/api/perfiles", "/api/perfiles/**").hasRole("ADMIN")
            .requestMatchers("/api/vehiculos", "/api/vehiculos/**", "/api/servicios", "/api/servicios/**", "/api/ordenes", "/api/ordenes/**").hasAnyRole("ADMIN", "EMPLEADO")
            .anyRequest().denyAll())
            .formLogin(login -> login.loginProcessingUrl("/api/auth/login")
                .usernameParameter("usuario").passwordParameter("contrasena")
                .successHandler((req, res, auth) -> res.setStatus(204))
                .failureHandler((req, res, error) -> responder(res, 401, "Usuario o contraseña incorrectos")))
            .logout(logout -> logout.logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true).clearAuthentication(true).deleteCookies("JSESSIONID")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
            .exceptionHandling(errores -> errores
                .authenticationEntryPoint((req, res, error) -> responder(res, 401, "Inicia sesión para continuar"))
                .accessDeniedHandler((req, res, error) -> responder(res, 403, "No tienes permiso para realizar esta operación")))
            .requestCache(cache -> cache.disable())
            .addFilterBefore(new OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                        throws ServletException, IOException {
                    var auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                        try {
                            var actual = acceso.loadUserByUsername(auth.getName());
                            if (!actual.isEnabled()) throw new UsernameNotFoundException("Cuenta inactiva");
                            var contexto = SecurityContextHolder.createEmptyContext();
                            contexto.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(actual.getUsername(), null, actual.getAuthorities()));
                            SecurityContextHolder.setContext(contexto);
                        } catch (UsernameNotFoundException error) {
                            SecurityContextHolder.clearContext();
                            var sesion = req.getSession(false);
                            if (sesion != null) sesion.invalidate();
                            responder(res, 401, "Tu sesión ya no está disponible");
                            return;
                        }
                    }
                    chain.doFilter(req, res);
                }
            }, AuthorizationFilter.class);
        return http.build();
    }
    private static void responder(HttpServletResponse res, int estado, String mensaje) throws IOException {
        res.setStatus(estado);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"mensaje\":\"" + mensaje + "\"}");
    }
}
