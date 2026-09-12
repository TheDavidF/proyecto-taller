package com.proyecto.taller.service;

import com.proyecto.taller.dto.ServicioDTO;
import com.proyecto.taller.entity.Servicio;
import com.proyecto.taller.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    public List<ServicioDTO> listarTodos() {
        return servicioRepository.findAll().stream()
                .map(this::convertirADto)
                .collect(Collectors.toList());
    }

    public ServicioDTO obtenerPorId(Long id) {
        Servicio servicio = servicioRepository.findById(id).orElse(null);
        return servicio != null ? convertirADto(servicio) : null;
    }

    public ServicioDTO guardar(ServicioDTO dto) {
        Servicio servicio = convertirAEntidad(dto);
        Servicio guardado = servicioRepository.save(servicio);
        return convertirADto(guardado);
    }

    public void eliminar(Long id) {
        servicioRepository.deleteById(id);
    }

    private ServicioDTO convertirADto(Servicio servicio) {
        ServicioDTO dto = new ServicioDTO();
        dto.setId(servicio.getId());
        dto.setNombre(servicio.getNombre());
        dto.setPrecio(servicio.getPrecio());
        return dto;
    }

    private Servicio convertirAEntidad(ServicioDTO dto) {
        Servicio servicio = new Servicio();
        servicio.setId(dto.getId());
        servicio.setNombre(dto.getNombre());
        servicio.setPrecio(dto.getPrecio());
        return servicio;
    }
}