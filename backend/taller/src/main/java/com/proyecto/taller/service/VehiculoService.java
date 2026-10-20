package com.proyecto.taller.service;

import java.util.List;
import com.proyecto.taller.dto.VehiculoDTO;
import com.proyecto.taller.entity.Vehiculo;
import com.proyecto.taller.repository.VehiculoRepository;
import com.proyecto.taller.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class VehiculoService {
    private final VehiculoRepository repository;
    public VehiculoService(VehiculoRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<VehiculoDTO> listar(boolean incluirInactivos) {
        return (incluirInactivos ? repository.findAll() : repository.findByEstadoTrue())
                .stream().map(this::toDto).toList();
    }
    public VehiculoDTO obtenerPorId(Integer id) { return toDto(buscar(id)); }
    public VehiculoDTO crear(VehiculoDTO dto) { return guardar(null, dto); }
    public VehiculoDTO actualizar(Integer id, VehiculoDTO dto) { return guardar(id, dto); }
    private VehiculoDTO guardar(Integer id, VehiculoDTO dto) {
        Vehiculo entity = id == null ? new Vehiculo() : buscar(id);
        if (repository.existsByPlacaAndIdVehiculoNot(dto.getPlaca().trim(), id == null ? -1 : id))
            throw ApiException.conflicto("Ya existe un vehículo con esa placa");
        entity.setPlaca(dto.getPlaca().trim());
        entity.setMarca(dto.getMarca().trim());
        entity.setModelo(dto.getModelo().trim());
        entity.setPropietario(dto.getPropietario().trim());
        entity.setTelefonoPropietario(dto.getTelefonoPropietario().trim());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return toDto(repository.save(entity));
    }
    public void anular(Integer id) { buscar(id).setEstado(false); }
    public VehiculoDTO activar(Integer id) {
        Vehiculo entity = buscar(id);
        entity.setEstado(true);
        return toDto(entity);
    }
    private Vehiculo buscar(Integer id) {
        return repository.findById(id).orElseThrow(() -> ApiException.noEncontrado("Vehiculo"));
    }
    private VehiculoDTO toDto(Vehiculo entity) {
        VehiculoDTO dto = new VehiculoDTO();
        dto.setIdVehiculo(entity.getIdVehiculo());
        dto.setPlaca(entity.getPlaca());
        dto.setMarca(entity.getMarca());
        dto.setModelo(entity.getModelo());
        dto.setPropietario(entity.getPropietario());
        dto.setTelefonoPropietario(entity.getTelefonoPropietario());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}
