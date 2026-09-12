package com.proyecto.taller.controller;

import com.proyecto.taller.dto.PerfilDTO;
import com.proyecto.taller.service.PerfilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfiles")
public class PerfilController {

    @Autowired
    private PerfilService perfilService;

    @GetMapping
    public List<PerfilDTO> listar() {
        return perfilService.listarTodos();
    }

    @GetMapping("/{id}")
    public PerfilDTO obtenerPorId(@PathVariable Long id) {
        return perfilService.obtenerPorId(id);
    }

    @PostMapping
    public PerfilDTO guardar(@RequestBody PerfilDTO perfilDTO) {
        return perfilService.guardar(perfilDTO);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        perfilService.eliminar(id);
    }
}