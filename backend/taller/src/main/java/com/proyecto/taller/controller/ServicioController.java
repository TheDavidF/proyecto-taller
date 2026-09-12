package com.proyecto.taller.controller;

import com.proyecto.taller.dto.ServicioDTO;
import com.proyecto.taller.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @GetMapping
    public List<ServicioDTO> listar() {
        return servicioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ServicioDTO obtenerPorId(@PathVariable Long id) {
        return servicioService.obtenerPorId(id);
    }

    @PostMapping
    public ServicioDTO guardar(@RequestBody ServicioDTO servicioDTO) {
        return servicioService.guardar(servicioDTO);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        servicioService.eliminar(id);
    }
}