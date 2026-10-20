package com.proyecto.taller.service;

import java.math.BigDecimal;
import java.util.*;
import com.proyecto.taller.dto.*;
import com.proyecto.taller.entity.*;
import com.proyecto.taller.repository.*;
import com.proyecto.taller.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrdenServicioService {
    private final OrdenServicioRepository repository;
    private final VehiculoRepository vehiculos;
    private final UsuarioRepository usuarios;
    private final ServicioRepository servicios;
    public OrdenServicioService(OrdenServicioRepository repository, VehiculoRepository vehiculos,
            UsuarioRepository usuarios, ServicioRepository servicios) {
        this.repository = repository; this.vehiculos = vehiculos;
        this.usuarios = usuarios; this.servicios = servicios;
    }
    @Transactional(readOnly = true)
    public List<OrdenDto> listar(boolean incluirInactivos) {
        return (incluirInactivos ? repository.findAll() : repository.findByEstadoTrue())
                .stream().map(this::toDto).toList();
    }
    @Transactional(readOnly = true)
    public OrdenDto obtenerPorId(Integer id) { return toDto(buscar(id)); }
    public OrdenDto guardar(OrdenDto dto) { return guardar(null, dto); }
    public OrdenDto actualizar(Integer id, OrdenDto dto) { return guardar(id, dto); }

    private OrdenDto guardar(Integer id, OrdenDto dto) {
        OrdenServicio orden = id == null ? new OrdenServicio() : buscar(id);
        if (id != null && !Boolean.TRUE.equals(orden.getEstado()))
            throw ApiException.conflicto("Activa la orden antes de modificarla");
        if (dto.getFechaEntrega() != null && dto.getFechaEntrega().isBefore(dto.getFechaIngreso()))
            throw ApiException.invalido("La fecha de entrega no puede ser anterior al ingreso");
        Vehiculo vehiculo = vehiculos.findById(dto.getIdVehiculo())
                .orElseThrow(() -> ApiException.noEncontrado("Vehículo"));
        Usuario usuario = usuarios.findById(dto.getIdUsuario())
                .orElseThrow(() -> ApiException.noEncontrado("Usuario"));
        if (!Boolean.TRUE.equals(vehiculo.getEstado()) || !Boolean.TRUE.equals(usuario.getEstado())
                || !Boolean.TRUE.equals(usuario.getPerfil().getEstado()))
            throw ApiException.conflicto("El vehículo, usuario y perfil deben estar activos");
        orden.setVehiculo(vehiculo); orden.setUsuario(usuario);
        orden.setFechaIngreso(dto.getFechaIngreso()); orden.setFechaEntrega(dto.getFechaEntrega());
        orden.setEstadoOrden(dto.getEstadoOrden());
        if (dto.getEstado() != null) orden.setEstado(dto.getEstado());

        Map<Integer, DetalleOrden> existentes = new HashMap<>();
        for (DetalleOrden d : orden.getDetalles()) existentes.put(d.getIdDetalleOrden(), d);
        Set<Integer> usados = new HashSet<>();
        List<DetalleOrden> resultado = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (DetalleOrdenDto d : dto.getDetalles()) {
            DetalleOrden detalle;
            if (d.getIdDetalleOrden() == null) detalle = new DetalleOrden();
            else {
                detalle = existentes.get(d.getIdDetalleOrden());
                if (detalle == null || !usados.add(d.getIdDetalleOrden()))
                    throw ApiException.invalido("Detalle repetido o ajeno a la orden");
            }
            Servicio servicio = servicios.findById(d.getIdServicio())
                    .orElseThrow(() -> ApiException.noEncontrado("Servicio"));
            if (!Boolean.TRUE.equals(servicio.getEstado()))
                throw ApiException.conflicto("El servicio está inactivo");
            detalle.setOrdenServicio(orden); detalle.setServicio(servicio);
            detalle.setPrecioAplicado(d.getPrecioAplicado()); detalle.setObservaciones(d.getObservaciones());
            detalle.setEstado(d.getEstado() != null ? d.getEstado() : true);
            resultado.add(detalle);
            if (Boolean.TRUE.equals(detalle.getEstado())) total = total.add(detalle.getPrecioAplicado());
        }
        if (resultado.stream().noneMatch(d -> Boolean.TRUE.equals(d.getEstado())))
            throw ApiException.invalido("La orden necesita al menos un detalle activo");
        if (total.compareTo(new BigDecimal("99999999.99")) > 0)
            throw ApiException.invalido("El total supera el límite permitido");
        orden.getDetalles().removeIf(d -> !resultado.contains(d));
        for (DetalleOrden d : resultado) if (!orden.getDetalles().contains(d)) orden.getDetalles().add(d);
        orden.setTotal(total);
        return toDto(repository.saveAndFlush(orden));
    }
    public void eliminar(Integer id) { buscar(id).setEstado(false); }
    public OrdenDto activar(Integer id) {
        OrdenServicio orden = buscar(id); orden.setEstado(true); return toDto(orden);
    }
    private OrdenServicio buscar(Integer id) {
        return repository.findById(id).orElseThrow(() -> ApiException.noEncontrado("Orden"));
    }
    private OrdenDto toDto(OrdenServicio orden) {
        OrdenDto dto = new OrdenDto();
        dto.setIdOrden(orden.getIdOrden()); dto.setIdVehiculo(orden.getVehiculo().getIdVehiculo());
        dto.setIdUsuario(orden.getUsuario().getIdUsuario()); dto.setFechaIngreso(orden.getFechaIngreso());
        dto.setFechaEntrega(orden.getFechaEntrega()); dto.setEstadoOrden(orden.getEstadoOrden());
        dto.setEstado(orden.getEstado()); dto.setTotal(orden.getTotal());
        dto.setDetalles(orden.getDetalles().stream().map(d -> {
            DetalleOrdenDto out = new DetalleOrdenDto();
            out.setIdDetalleOrden(d.getIdDetalleOrden()); out.setIdOrden(orden.getIdOrden());
            out.setIdServicio(d.getServicio().getIdServicio()); out.setPrecioAplicado(d.getPrecioAplicado());
            out.setObservaciones(d.getObservaciones()); out.setEstado(d.getEstado()); return out;
        }).toList());
        return dto;
    }
}
