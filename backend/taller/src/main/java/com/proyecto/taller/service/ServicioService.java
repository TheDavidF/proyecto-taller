package com.proyecto.taller.service;

import java.util.List;
import com.proyecto.taller.dto.ServicioDTO;
import com.proyecto.taller.entity.Servicio;
import com.proyecto.taller.repository.ServicioRepository;
import com.proyecto.taller.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ServicioService {
    private final ServicioRepository repository;
    public ServicioService(ServicioRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<ServicioDTO> listar(boolean incluirInactivos) {
        return (incluirInactivos ? repository.findAll() : repository.findByEstadoTrue())
                .stream().map(this::toDto).toList();
    }
    public ServicioDTO obtenerPorId(Integer id) { return toDto(buscar(id)); }
    public ServicioDTO crear(ServicioDTO dto) { return guardar(null, dto); }
    public ServicioDTO actualizar(Integer id, ServicioDTO dto) { return guardar(id, dto); }
    private ServicioDTO guardar(Integer id, ServicioDTO dto) {
        Servicio entity = id == null ? new Servicio() : buscar(id);
        entity.setNombre(dto.getNombre().trim());
        entity.setPrecioBase(dto.getPrecioBase());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return toDto(repository.save(entity));
    }
    public void anular(Integer id) { buscar(id).setEstado(false); }
    public ServicioDTO activar(Integer id) {
        Servicio entity = buscar(id);
        entity.setEstado(true);
        return toDto(entity);
    }
    private Servicio buscar(Integer id) {
        return repository.findById(id).orElseThrow(() -> ApiException.noEncontrado("Servicio"));
    }
    private ServicioDTO toDto(Servicio entity) {
        ServicioDTO dto = new ServicioDTO();
        dto.setIdServicio(entity.getIdServicio());
        dto.setNombre(entity.getNombre());
        dto.setPrecioBase(entity.getPrecioBase());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}
