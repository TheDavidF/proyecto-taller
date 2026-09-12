package com.proyecto.taller.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyecto.taller.dto.OrdenDto;
import com.proyecto.taller.service.OrdenServicioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    private final OrdenServicioService ordenServicioService;

    public OrdenController(OrdenServicioService ordenServicioService) {
        this.ordenServicioService = ordenServicioService;
    }

    @GetMapping
    public ResponseEntity<List<OrdenDto>> listar() {
        return ResponseEntity.ok(ordenServicioService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenDto> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ordenServicioService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<OrdenDto> crear(@Valid @RequestBody OrdenDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordenServicioService.guardar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdenDto> actualizar(@PathVariable Integer id, @Valid @RequestBody OrdenDto dto) {
        return ResponseEntity.ok(ordenServicioService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        ordenServicioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
