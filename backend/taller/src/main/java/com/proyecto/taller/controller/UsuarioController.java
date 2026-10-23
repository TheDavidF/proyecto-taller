package com.proyecto.taller.controller;

import java.util.List;
import jakarta.validation.Valid;
import com.proyecto.taller.dto.UsuarioDTO;
import com.proyecto.taller.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService service;
    public UsuarioController(UsuarioService service) { this.service = service; }
    @GetMapping
    public List<UsuarioDTO> listar(@RequestParam(defaultValue = "false") boolean incluirInactivos) {
        return service.listar(incluirInactivos);
    }
    @GetMapping("/{id}")
    public UsuarioDTO obtener(@PathVariable Integer id) { return service.obtenerPorId(id); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDTO crear(@Valid @RequestBody UsuarioDTO dto) { return service.crear(dto); }
    @PutMapping("/{id}")
    public UsuarioDTO actualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioDTO dto) {
        return service.actualizar(id, dto);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anular(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/anular")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anularPorPut(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/activar")
    public UsuarioDTO activar(@PathVariable Integer id) { return service.activar(id); }
}
