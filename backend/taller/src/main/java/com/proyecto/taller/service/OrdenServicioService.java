package com.proyecto.taller.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.taller.dto.DetalleOrdenDto;
import com.proyecto.taller.dto.OrdenDto;
import com.proyecto.taller.entity.DetalleOrden;
import com.proyecto.taller.entity.OrdenServicio;
import com.proyecto.taller.entity.Servicio;
import com.proyecto.taller.entity.Usuario;
import com.proyecto.taller.entity.Vehiculo;
import com.proyecto.taller.repository.DetalleOrdenRepository;
import com.proyecto.taller.repository.OrdenServicioRepository;
import com.proyecto.taller.repository.ServicioRepository;
import com.proyecto.taller.repository.UsuarioRepository;
import com.proyecto.taller.repository.VehiculoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class OrdenServicioService {

    private final OrdenServicioRepository ordenServicioRepository;
    private final DetalleOrdenRepository detalleOrdenRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;

    public OrdenServicioService(OrdenServicioRepository ordenServicioRepository,
                               DetalleOrdenRepository detalleOrdenRepository,
                               VehiculoRepository vehiculoRepository,
                               UsuarioRepository usuarioRepository,
                               ServicioRepository servicioRepository) {
        this.ordenServicioRepository = ordenServicioRepository;
        this.detalleOrdenRepository = detalleOrdenRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicioRepository = servicioRepository;
    }

    @Transactional
    public OrdenDto guardar(OrdenDto dto) {
        Vehiculo vehiculo = vehiculoRepository.findById(dto.getIdVehiculo())
                .orElseThrow(() -> new EntityNotFoundException("Vehículo no encontrado con id: " + dto.getIdVehiculo()));
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + dto.getIdUsuario()));

        OrdenServicio orden = new OrdenServicio();
        orden.setVehiculo(vehiculo);
        orden.setUsuario(usuario);
        orden.setFechaIngreso(dto.getFechaIngreso());
        orden.setFechaEntrega(dto.getFechaEntrega());
        orden.setEstadoOrden(dto.getEstadoOrden());
        orden.setEstado(dto.getEstado() != null ? dto.getEstado() : true);

        OrdenServicio ordenGuardada = ordenServicioRepository.save(orden);

        List<DetalleOrden> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (DetalleOrdenDto detalleDto : dto.getDetalles()) {
            Servicio servicio = servicioRepository.findById(detalleDto.getIdServicio())
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + detalleDto.getIdServicio()));

            DetalleOrden detalle = new DetalleOrden();
            detalle.setOrdenServicio(ordenGuardada);
            detalle.setServicio(servicio);
            detalle.setPrecioAplicado(detalleDto.getPrecioAplicado());
            detalle.setObservaciones(detalleDto.getObservaciones());
            detalle.setEstado(detalleDto.getEstado() != null ? detalleDto.getEstado() : true);
            detalles.add(detalle);
            total = total.add(detalleDto.getPrecioAplicado());
        }

        ordenGuardada.setDetalles(detalles);
        detalleOrdenRepository.saveAll(detalles);
        ordenGuardada.setTotal(total);
        OrdenServicio ordenFinal = ordenServicioRepository.save(ordenGuardada);

        return mapToDto(ordenFinal, detalles);
    }

    @Transactional(readOnly = true)
    public List<OrdenDto> listar() {
        return ordenServicioRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrdenDto obtenerPorId(Integer idOrden) {
        OrdenServicio orden = ordenServicioRepository.findById(idOrden)
                .orElseThrow(() -> new EntityNotFoundException("Orden de servicio no encontrada con id: " + idOrden));

        return mapToDto(orden);
    }

    @Transactional
    public OrdenDto actualizar(Integer idOrden, OrdenDto dto) {
        OrdenServicio orden = ordenServicioRepository.findById(idOrden)
                .orElseThrow(() -> new EntityNotFoundException("Orden de servicio no encontrada con id: " + idOrden));

        Vehiculo vehiculo = vehiculoRepository.findById(dto.getIdVehiculo())
                .orElseThrow(() -> new EntityNotFoundException("Vehículo no encontrado con id: " + dto.getIdVehiculo()));
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + dto.getIdUsuario()));

        orden.setVehiculo(vehiculo);
        orden.setUsuario(usuario);
        orden.setFechaIngreso(dto.getFechaIngreso());
        orden.setFechaEntrega(dto.getFechaEntrega());
        orden.setEstadoOrden(dto.getEstadoOrden());
        orden.setEstado(dto.getEstado() != null ? dto.getEstado() : true);

        List<DetalleOrden> detallesActuales = detalleOrdenRepository.findByOrdenServicioIdOrden(idOrden);
        if (!detallesActuales.isEmpty()) {
            detalleOrdenRepository.deleteAll(detallesActuales);
        }

        List<DetalleOrden> nuevosDetalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (DetalleOrdenDto detalleDto : dto.getDetalles()) {
            Servicio servicio = servicioRepository.findById(detalleDto.getIdServicio())
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + detalleDto.getIdServicio()));

            DetalleOrden detalle = new DetalleOrden();
            detalle.setOrdenServicio(orden);
            detalle.setServicio(servicio);
            detalle.setPrecioAplicado(detalleDto.getPrecioAplicado());
            detalle.setObservaciones(detalleDto.getObservaciones());
            detalle.setEstado(detalleDto.getEstado() != null ? detalleDto.getEstado() : true);
            nuevosDetalles.add(detalle);
            total = total.add(detalleDto.getPrecioAplicado());
        }

        orden.setDetalles(nuevosDetalles);
        detalleOrdenRepository.saveAll(nuevosDetalles);
        orden.setTotal(total);
        OrdenServicio ordenActualizada = ordenServicioRepository.save(orden);

        return mapToDto(ordenActualizada, nuevosDetalles);
    }

    @Transactional
    public void eliminar(Integer idOrden) {
        OrdenServicio orden = ordenServicioRepository.findById(idOrden)
                .orElseThrow(() -> new EntityNotFoundException("Orden de servicio no encontrada con id: " + idOrden));

        List<DetalleOrden> detalles = detalleOrdenRepository.findByOrdenServicioIdOrden(idOrden);
        if (!detalles.isEmpty()) {
            detalleOrdenRepository.deleteAll(detalles);
        }

        ordenServicioRepository.delete(orden);
    }

    private OrdenDto mapToDto(OrdenServicio orden) {
        List<DetalleOrden> detalles = detalleOrdenRepository.findByOrdenServicioIdOrden(orden.getIdOrden());
        return mapToDto(orden, detalles);
    }

    private OrdenDto mapToDto(OrdenServicio orden, List<DetalleOrden> detalles) {
        OrdenDto dto = new OrdenDto();
        dto.setIdOrden(orden.getIdOrden());
        dto.setIdVehiculo(orden.getVehiculo() != null ? orden.getVehiculo().getIdVehiculo() : null);
        dto.setIdUsuario(orden.getUsuario() != null ? orden.getUsuario().getIdUsuario() : null);
        dto.setFechaIngreso(orden.getFechaIngreso());
        dto.setFechaEntrega(orden.getFechaEntrega());
        dto.setTotal(orden.getTotal());
        dto.setEstadoOrden(orden.getEstadoOrden());
        dto.setEstado(orden.getEstado());
        dto.setDetalles(detalles.stream().map(this::mapDetalleToDto).collect(Collectors.toList()));
        return dto;
    }

    private DetalleOrdenDto mapDetalleToDto(DetalleOrden detalle) {
        DetalleOrdenDto dto = new DetalleOrdenDto();
        dto.setIdDetalleOrden(detalle.getIdDetalleOrden());
        dto.setIdOrden(detalle.getOrdenServicio() != null ? detalle.getOrdenServicio().getIdOrden() : null);
        dto.setIdServicio(detalle.getServicio() != null ? detalle.getServicio().getIdServicio() : null);
        dto.setPrecioAplicado(detalle.getPrecioAplicado());
        dto.setObservaciones(detalle.getObservaciones());
        dto.setEstado(detalle.getEstado());
        return dto;
    }
}

