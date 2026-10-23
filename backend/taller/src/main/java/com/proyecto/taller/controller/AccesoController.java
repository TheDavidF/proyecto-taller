package com.proyecto.taller.controller;

import java.security.Principal;
import java.util.Map;
import com.proyecto.taller.service.AccesoService;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AccesoController {
    private final AccesoService acceso;
    public AccesoController(AccesoService acceso) { this.acceso = acceso; }
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }
    @GetMapping("/me")
    public AccesoService.Sesion actual(Principal principal) { return acceso.sesion(principal.getName()); }
}
