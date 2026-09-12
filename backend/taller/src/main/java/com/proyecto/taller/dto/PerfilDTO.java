package com.proyecto.taller.dto;

public class PerfilDTO {
    private Integer idPerfil;
    private String nombre;
    private Boolean estado;

    public PerfilDTO() {
    }

    public PerfilDTO(Integer idPerfil, String nombre, Boolean estado) {
        this.idPerfil = idPerfil;
        this.nombre = nombre;
        this.estado = estado;
    }

    public Integer getIdPerfil() {
        return idPerfil;
    }

    public void setIdPerfil(Integer idPerfil) {
        this.idPerfil = idPerfil;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }
}