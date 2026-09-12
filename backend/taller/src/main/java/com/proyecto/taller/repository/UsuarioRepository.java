package com.proyecto.taller.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.taller.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
}
