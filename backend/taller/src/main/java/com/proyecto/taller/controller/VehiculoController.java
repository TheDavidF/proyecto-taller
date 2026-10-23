package com.proyecto.taller.controller;

import java.util.List;
import jakarta.validation.Valid;
import com.proyecto.taller.dto.VehiculoDTO;
import com.proyecto.taller.service.VehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {
    private final VehiculoService service;
    public VehiculoController(VehiculoService service) { this.service = service; }
    @GetMapping
    public List<VehiculoDTO> listar(@RequestParam(defaultValue = "false") boolean incluirInactivos) {
        return service.listar(incluirInactivos);
    }
    @GetMapping("/{id}")
    public VehiculoDTO obtener(@PathVariable Integer id) { return service.obtenerPorId(id); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehiculoDTO crear(@Valid @RequestBody VehiculoDTO dto) { return service.crear(dto); }
    @PutMapping("/{id}")
    public VehiculoDTO actualizar(@PathVariable Integer id, @Valid @RequestBody VehiculoDTO dto) {
        return service.actualizar(id, dto);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anular(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/anular")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anularPorPut(@PathVariable Integer id) { service.anular(id); }
    @PutMapping("/{id}/activar")
    public VehiculoDTO activar(@PathVariable Integer id) { return service.activar(id); }
}
