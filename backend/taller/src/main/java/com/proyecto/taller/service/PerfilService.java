package com.proyecto.taller.service;

import java.util.List;
import com.proyecto.taller.dto.PerfilDTO;
import com.proyecto.taller.entity.Perfil;
import com.proyecto.taller.repository.PerfilRepository;
import com.proyecto.taller.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PerfilService {
    private final PerfilRepository repository;
    public PerfilService(PerfilRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<PerfilDTO> listar(boolean incluirInactivos) {
        return (incluirInactivos ? repository.findAll() : repository.findByEstadoTrue())
                .stream().map(this::toDto).toList();
    }
    public PerfilDTO obtenerPorId(Integer id) { return toDto(buscar(id)); }
    public PerfilDTO crear(PerfilDTO dto) { return guardar(null, dto); }
    public PerfilDTO actualizar(Integer id, PerfilDTO dto) { return guardar(id, dto); }
    private PerfilDTO guardar(Integer id, PerfilDTO dto) {
        Perfil entity = id == null ? new Perfil() : buscar(id);
        entity.setNombre(dto.getNombre().trim());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return toDto(repository.save(entity));
    }
    public void anular(Integer id) { buscar(id).setEstado(false); }
    public PerfilDTO activar(Integer id) {
        Perfil entity = buscar(id);
        entity.setEstado(true);
        return toDto(entity);
    }
    private Perfil buscar(Integer id) {
        return repository.findById(id).orElseThrow(() -> ApiException.noEncontrado("Perfil"));
    }
    private PerfilDTO toDto(Perfil entity) {
        PerfilDTO dto = new PerfilDTO();
        dto.setIdPerfil(entity.getIdPerfil());
        dto.setNombre(entity.getNombre());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}
