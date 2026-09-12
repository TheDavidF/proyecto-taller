package com.proyecto.taller.service;

import com.proyecto.taller.dto.PerfilDTO;
import com.proyecto.taller.entity.Perfil;
import com.proyecto.taller.repository.PerfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerfilService {

    @Autowired
    private PerfilRepository perfilRepository;

    public List<PerfilDTO> listarTodos() {
        return perfilRepository.findAll().stream()
                .map(this::convertirADto)
                .collect(Collectors.toList());
    }

    public PerfilDTO obtenerPorId(Long id) {
        Perfil perfil = perfilRepository.findById(id).orElse(null);
        return perfil != null ? convertirADto(perfil) : null;
    }

    public PerfilDTO guardar(PerfilDTO dto) {
        Perfil perfil = convertirAEntidad(dto);
        Perfil guardado = perfilRepository.save(perfil);
        return convertirADto(guardado);
    }

    public void eliminar(Long id) {
        perfilRepository.deleteById(id);
    }

    private PerfilDTO convertirADto(Perfil perfil) {
        PerfilDTO dto = new PerfilDTO();
        dto.setId(perfil.getId());
        dto.setNombre(perfil.getNombre());
        dto.setDescripcion(perfil.getDescripcion());
        return dto;
    }

    private Perfil convertirAEntidad(PerfilDTO dto) {
        Perfil perfil = new Perfil();
        perfil.setId(dto.getId());
        perfil.setNombre(dto.getNombre());
        perfil.setDescripcion(dto.getDescripcion());
        return perfil;
    }
}