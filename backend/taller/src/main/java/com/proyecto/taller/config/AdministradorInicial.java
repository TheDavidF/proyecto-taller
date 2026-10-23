package com.proyecto.taller.config;

import java.nio.charset.StandardCharsets;
import com.proyecto.taller.entity.*;
import com.proyecto.taller.repository.*;
import com.proyecto.taller.service.AccesoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdministradorInicial implements CommandLineRunner {
    private final UsuarioRepository usuarios;
    private final PerfilRepository perfiles;
    private final PasswordEncoder encoder;
    private final String usuario, clave;
    public AdministradorInicial(UsuarioRepository usuarios, PerfilRepository perfiles, PasswordEncoder encoder,
            @Value("${ADMIN_USER:}") String usuario, @Value("${ADMIN_PASSWORD:}") String clave) {
        this.usuarios = usuarios; this.perfiles = perfiles; this.encoder = encoder;
        this.usuario = usuario.trim(); this.clave = clave;
    }
    @Override
    @Transactional
    public void run(String... args) {
        if (usuario.isEmpty() && clave.isEmpty()) return;
        if (usuario.isEmpty() || usuario.length() > 50 || clave.isBlank() || clave.length() < 8 || clave.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new IllegalArgumentException("Define ADMIN_USER y ADMIN_PASSWORD (mínimo 8 caracteres, máximo 72 bytes)");
        if (usuarios.findByUsuario(usuario).isPresent()) return;
        Perfil perfil = perfiles.findByEstadoTrue().stream()
            .filter(p -> "ADMIN".equals(AccesoService.rol(p.getNombre()))).findFirst().orElseGet(() -> {
                Perfil nuevo = new Perfil(); nuevo.setNombre("Administrador"); return perfiles.save(nuevo);
            });
        if (perfiles.findAll().stream().noneMatch(p -> "EMPLEADO".equals(AccesoService.rol(p.getNombre())))) {
            Perfil empleado = new Perfil(); empleado.setNombre("Empleado"); perfiles.save(empleado);
        }
        Usuario nuevo = new Usuario(); nuevo.setPerfil(perfil); nuevo.setNombre("Administrador");
        nuevo.setUsuario(usuario); nuevo.setCorreo("admin@taller.local"); nuevo.setContrasena(encoder.encode(clave));
        usuarios.save(nuevo);
    }
}
