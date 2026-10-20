package com.proyecto.taller.controller;

import java.util.List;
import jakarta.validation.Valid;
import com.proyecto.taller.dto.PerfilDTO;
import com.proyecto.taller.service.PerfilService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfiles")
public class PerfilController {
    private final PerfilService service;
    public PerfilController(PerfilService service) { this.service = service; }
    @GetMapping
    public List<PerfilDTO> listar(@RequestParam(defaultValue = "false") boolean incluirInactivos) {
        return service.listar(incluirInactivos);
    }
    @GetMapping("/{id}")
    public PerfilDTO obtener(@PathVariable Integer id) { return service.obtenerPorId(id); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PerfilDTO crear(@Valid @RequestBody PerfilDTO dto) { return service.crear(dto); }
    @PutMapping("/{id}")
    public PerfilDTO actualizar(@PathVariable Integer id, @Valid @RequestBody PerfilDTO dto) {
        return service.actualizar(id, dto);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anular(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/anular")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anularPorPut(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/activar")
    public PerfilDTO activar(@PathVariable Integer id) { return service.activar(id); }
}
