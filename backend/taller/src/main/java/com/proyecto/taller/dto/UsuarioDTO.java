package com.proyecto.taller.dto;

public class UsuarioDTO {

    private Integer idUsuario;
    private String nombre;
    private String email;
    private String password;
    private Integer idPerfil;
    private Boolean estado;

    public UsuarioDTO() {
        this.estado = true;
    }

    public UsuarioDTO(Integer idUsuario, String nombre, String email, String password, Integer idPerfil, Boolean estado) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.idPerfil = idPerfil;
        this.estado = estado != null ? estado : true;
    }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Integer getIdPerfil() { return idPerfil; }
    public void setIdPerfil(Integer idPerfil) { this.idPerfil = idPerfil; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}