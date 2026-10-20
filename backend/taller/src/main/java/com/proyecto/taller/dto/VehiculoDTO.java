package com.proyecto.taller.dto;

public class VehiculoDTO {

    private Integer idVehiculo;
    private String placa;
    private String marca;
    private String modelo;
    private String propietario;
    private String telefonoPropietario;
    private Boolean estado;

    public VehiculoDTO() {
        this.estado = true;
    }

    public VehiculoDTO(Integer idVehiculo, String placa, String marca, String modelo, String propietario, String telefonoPropietario, Boolean estado) {
        this.idVehiculo = idVehiculo;
        this.placa = placa;
        this.marca = marca;
        this.modelo = modelo;
        this.propietario = propietario;
        this.telefonoPropietario = telefonoPropietario;
        this.estado = estado != null ? estado : true;
    }

    public Integer getIdVehiculo() { return idVehiculo; }
    public void setIdVehiculo(Integer idVehiculo) { this.idVehiculo = idVehiculo; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getPropietario() { return propietario; }
    public void setPropietario(String propietario) { this.propietario = propietario; }

    public String getTelefonoPropietario() { return telefonoPropietario; }
    public void setTelefonoPropietario(String telefonoPropietario) { this.telefonoPropietario = telefonoPropietario; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}