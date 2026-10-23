package com.proyecto.taller.controller;

import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class WebController {
    @GetMapping({"/perfiles", "/usuarios", "/vehiculos", "/servicios", "/ordenes", "/reportes"})
    public String frontend() { return "forward:/index.html"; }

    @GetMapping("/api/health")
    @ResponseBody
    public Map<String, String> estado() { return Map.of("estado", "ok"); }
}
