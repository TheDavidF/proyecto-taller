package com.proyecto.taller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class OrdenDto {

    private Integer idOrden;
    private Integer idVehiculo;
    private Integer idUsuario;
    private LocalDate fechaIngreso;
    private LocalDate fechaEntrega;
    private BigDecimal total;
    private String estadoOrden;
    private Boolean estado;
    private List<DetalleOrdenDto> detalles;

    public OrdenDto() {
        this.total = BigDecimal.ZERO;
        this.estado = true;
        this.detalles = new ArrayList<>();
    }

    public OrdenDto(Integer idOrden, Integer idVehiculo, Integer idUsuario, LocalDate fechaIngreso, LocalDate fechaEntrega, BigDecimal total, String estadoOrden, Boolean estado, List<DetalleOrdenDto> detalles) {
        this.idOrden = idOrden;
        this.idVehiculo = idVehiculo;
        this.idUsuario = idUsuario;
        this.fechaIngreso = fechaIngreso;
        this.fechaEntrega = fechaEntrega;
        this.total = total != null ? total : BigDecimal.ZERO;
        this.estadoOrden = estadoOrden;
        this.estado = estado != null ? estado : true;
        this.detalles = detalles != null ? detalles : new ArrayList<>();
    }

    public Integer getIdOrden() { return idOrden; }
    public void setIdOrden(Integer idOrden) { this.idOrden = idOrden; }

    public Integer getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(Integer idVehiculo) { this.idVehiculo = idVehiculo; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getEstadoOrden() { return estadoOrden; }
    public void setEstadoOrden(String estadoOrden) { this.estadoOrden = estadoOrden; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public List<DetalleOrdenDto> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleOrdenDto> detalles) { this.detalles = detalles; }
}