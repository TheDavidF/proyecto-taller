package com.proyecto.taller.dto;

import java.math.BigDecimal;

public class ServicioDTO {
    private Integer idServicio;
    private String nombre;
    private BigDecimal precioBase;
    private Boolean estado;

    public ServicioDTO() {
    }

    public ServicioDTO(Integer idServicio, String nombre, BigDecimal precioBase, Boolean estado) {
        this.idServicio = idServicio;
        this.nombre = nombre;
        this.precioBase = precioBase;
        this.estado = estado;
    }

    public Integer getIdServicio() {
        return idServicio;
    }

    public void setIdServicio(Integer idServicio) {
        this.idServicio = idServicio;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getPrecioBase() {
        return precioBase;
    }

    public void setPrecioBase(BigDecimal precioBase) {
        this.precioBase = precioBase;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }
}