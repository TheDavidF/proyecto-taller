package com.proyecto.taller.service;

import com.proyecto.taller.dto.PerfilDTO;
import com.proyecto.taller.entity.Perfil;
import com.proyecto.taller.repository.PerfilRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;

    public PerfilService(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    public List<PerfilDTO> listarTodos() {
        return perfilRepository.findAll().stream()
                .map(this::convertirADto)
                .collect(Collectors.toList());
    }

    public PerfilDTO obtenerPorId(Integer id) {
        Perfil perfil = perfilRepository.findById(id).orElse(null);
        return perfil != null ? convertirADto(perfil) : null;
    }

    public PerfilDTO guardar(PerfilDTO dto) {
        Perfil perfil = convertirAEntidad(dto);
        Perfil guardado = perfilRepository.save(perfil);
        return convertirADto(guardado);
    }

    public void eliminar(Integer id) {
        perfilRepository.deleteById(id);
    }

    private PerfilDTO convertirADto(Perfil perfil) {
        PerfilDTO dto = new PerfilDTO();
        dto.setIdPerfil(perfil.getIdPerfil());
        dto.setNombre(perfil.getNombre());
        dto.setEstado(perfil.getEstado());
        return dto;
    }

    private Perfil convertirAEntidad(PerfilDTO dto) {
        Perfil perfil = new Perfil();
        perfil.setIdPerfil(dto.getIdPerfil());
        perfil.setNombre(dto.getNombre());
        perfil.setEstado(dto.getEstado() != null ? dto.getEstado() : true);
        return perfil;
    }
}