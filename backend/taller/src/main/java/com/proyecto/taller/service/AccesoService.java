package com.proyecto.taller.service;

import java.util.Locale;
import com.proyecto.taller.entity.Usuario;
import com.proyecto.taller.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.*;

@Service
@Transactional(readOnly = true)
public class AccesoService implements UserDetailsService {
    private final UsuarioRepository usuarios;
    public AccesoService(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    public static String rol(String nombre) {
        return switch (nombre.trim().toLowerCase(Locale.ROOT)) {
            case "administrador", "admin" -> "ADMIN";
            case "empleado" -> "EMPLEADO";
            default -> "";
        };
    }
    private Usuario buscar(String nombre) {
        return usuarios.findByUsuario(nombre).orElseThrow(() -> new UsernameNotFoundException("Usuario no disponible"));
    }
    @Override
    public UserDetails loadUserByUsername(String nombre) {
        Usuario u = buscar(nombre);
        String rol = rol(u.getPerfil().getNombre());
        return User.withUsername(u.getUsuario()).password(u.getContrasena())
            .authorities(rol.isEmpty() ? "SIN_ACCESO" : "ROLE_" + rol)
            .disabled(!Boolean.TRUE.equals(u.getEstado()) || !Boolean.TRUE.equals(u.getPerfil().getEstado()) || rol.isEmpty())
            .build();
    }
    public record Sesion(Integer idUsuario, String nombre, String usuario, String perfil, String rol) {}
    public Sesion sesion(String nombre) {
        Usuario u = buscar(nombre);
        return new Sesion(u.getIdUsuario(), u.getNombre(), u.getUsuario(), u.getPerfil().getNombre(), rol(u.getPerfil().getNombre()));
    }
}
