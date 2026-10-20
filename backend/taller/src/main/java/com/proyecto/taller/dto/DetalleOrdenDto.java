package com.proyecto.taller.dto;

import java.math.BigDecimal;

public class DetalleOrdenDto {

    private Integer idDetalleOrden;
    private Integer idOrden;
    private Integer idServicio;
    private BigDecimal precioAplicado;
    private String observaciones;
    private Boolean estado;

    public DetalleOrdenDto() {
        this.estado = true;
    }

    public DetalleOrdenDto(Integer idDetalleOrden, Integer idOrden, Integer idServicio, BigDecimal precioAplicado, String observaciones, Boolean estado) {
        this.idDetalleOrden = idDetalleOrden;
        this.idOrden = idOrden;
        this.idServicio = idServicio;
        this.precioAplicado = precioAplicado;
        this.observaciones = observaciones;
        this.estado = estado != null ? estado : true;
    }

    public Integer getIdDetalleOrden() { return idDetalleOrden; }
    public void setIdDetalleOrden(Integer idDetalleOrden) { this.idDetalleOrden = idDetalleOrden; }

    public Integer getIdOrden() { return idOrden; }
    public void setIdOrden(Integer idOrden) { this.idOrden = idOrden; }

    public Integer getIdServicio() { return idServicio; }
    public void setIdServicio(Integer idServicio) { this.idServicio = idServicio; }

    public BigDecimal getPrecioAplicado() { return precioAplicado; }
    public void setPrecioAplicado(BigDecimal precioAplicado) { this.precioAplicado = precioAplicado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}