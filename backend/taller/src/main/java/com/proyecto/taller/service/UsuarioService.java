package com.proyecto.taller.service;

import java.util.List;
import com.proyecto.taller.dto.UsuarioDTO;
import com.proyecto.taller.entity.Usuario;
import com.proyecto.taller.entity.Perfil;
import com.proyecto.taller.repository.UsuarioRepository;
import com.proyecto.taller.repository.PerfilRepository;
import com.proyecto.taller.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@Transactional
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PerfilRepository perfiles;
    private final PasswordEncoder encoder;
    public UsuarioService(UsuarioRepository repository, PerfilRepository perfiles, PasswordEncoder encoder) {
        this.repository = repository; this.perfiles = perfiles; this.encoder = encoder;
    }
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listar(boolean incluirInactivos) {
        return (incluirInactivos ? repository.findAll() : repository.findByEstadoTrue())
                .stream().map(this::toDto).toList();
    }
    public UsuarioDTO obtenerPorId(Integer id) { return toDto(buscar(id)); }
    public UsuarioDTO crear(UsuarioDTO dto) { return guardar(null, dto); }
    public UsuarioDTO actualizar(Integer id, UsuarioDTO dto) { return guardar(id, dto); }
    private UsuarioDTO guardar(Integer id, UsuarioDTO dto) {
        Usuario entity = id == null ? new Usuario() : buscar(id);
        Perfil perfil = perfiles.findById(dto.getIdPerfil())
                .orElseThrow(() -> ApiException.noEncontrado("Perfil"));
        if (!Boolean.TRUE.equals(perfil.getEstado())) throw ApiException.conflicto("El perfil está inactivo");
        if (repository.existsByUsuarioAndIdUsuarioNot(dto.getUsuario().trim(), id == null ? -1 : id))
            throw ApiException.conflicto("El nombre de usuario ya existe");
        if (id == null && (dto.getContrasena() == null || dto.getContrasena().isBlank()))
            throw ApiException.invalido("La contraseña es obligatoria al crear un usuario");
        entity.setPerfil(perfil);
        entity.setNombre(dto.getNombre().trim());
        entity.setUsuario(dto.getUsuario().trim());
        entity.setCorreo(dto.getCorreo().trim());
        if (dto.getContrasena() != null) {
            if (dto.getContrasena().isBlank() || dto.getContrasena().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
                throw ApiException.invalido("La contraseña no puede estar vacía ni superar 72 bytes UTF-8");
            entity.setContrasena(encoder.encode(dto.getContrasena()));
        }
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return toDto(repository.save(entity));
    }
    public void anular(Integer id) { buscar(id).setEstado(false); }
    public UsuarioDTO activar(Integer id) {
        Usuario entity = buscar(id);
        if (!Boolean.TRUE.equals(entity.getPerfil().getEstado())) throw ApiException.conflicto("El perfil está inactivo");
        entity.setEstado(true); return toDto(entity);
    }
    private Usuario buscar(Integer id) {
        return repository.findById(id).orElseThrow(() -> ApiException.noEncontrado("Usuario"));
    }
    private UsuarioDTO toDto(Usuario entity) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdUsuario(entity.getIdUsuario()); dto.setIdPerfil(entity.getPerfil().getIdPerfil());
        dto.setNombre(entity.getNombre()); dto.setUsuario(entity.getUsuario());
        dto.setCorreo(entity.getCorreo()); dto.setEstado(entity.getEstado());
        return dto;
    }
}
