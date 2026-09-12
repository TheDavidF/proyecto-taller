package com.proyecto.taller.service;

import com.proyecto.taller.dto.ServicioDTO;
import com.proyecto.taller.entity.Servicio;
import com.proyecto.taller.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<ServicioDTO> listarTodos() {
        return servicioRepository.findAll().stream()
                .map(this::convertirADto)
                .collect(Collectors.toList());
    }

    public ServicioDTO obtenerPorId(Integer id) {
        Servicio servicio = servicioRepository.findById(id).orElse(null);
        return servicio != null ? convertirADto(servicio) : null;
    }

    public ServicioDTO guardar(ServicioDTO dto) {
        Servicio servicio = convertirAEntidad(dto);
        Servicio guardado = servicioRepository.save(servicio);
        return convertirADto(guardado);
    }

    public void eliminar(Integer id) {
        servicioRepository.deleteById(id);
    }

    private ServicioDTO convertirADto(Servicio servicio) {
        ServicioDTO dto = new ServicioDTO();
        dto.setIdServicio(servicio.getIdServicio());
        dto.setNombre(servicio.getNombre());
        dto.setPrecioBase(servicio.getPrecioBase());
        dto.setEstado(servicio.getEstado());
        return dto;
    }

    private Servicio convertirAEntidad(ServicioDTO dto) {
        Servicio servicio = new Servicio();
        servicio.setIdServicio(dto.getIdServicio());
        servicio.setNombre(dto.getNombre());
        servicio.setPrecioBase(dto.getPrecioBase());
        servicio.setEstado(dto.getEstado() != null ? dto.getEstado() : true);
        return servicio;
    }
}