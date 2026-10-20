package com.proyecto.taller.controller;

import java.util.List;
import jakarta.validation.Valid;
import com.proyecto.taller.dto.ServicioDTO;
import com.proyecto.taller.service.ServicioService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {
    private final ServicioService service;
    public ServicioController(ServicioService service) { this.service = service; }
    @GetMapping
    public List<ServicioDTO> listar(@RequestParam(defaultValue = "false") boolean incluirInactivos) {
        return service.listar(incluirInactivos);
    }
    @GetMapping("/{id}")
    public ServicioDTO obtener(@PathVariable Integer id) { return service.obtenerPorId(id); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServicioDTO crear(@Valid @RequestBody ServicioDTO dto) { return service.crear(dto); }
    @PutMapping("/{id}")
    public ServicioDTO actualizar(@PathVariable Integer id, @Valid @RequestBody ServicioDTO dto) {
        return service.actualizar(id, dto);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anular(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/anular")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anularPorPut(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/activar")
    public ServicioDTO activar(@PathVariable Integer id) { return service.activar(id); }
}
