package com.proyecto.taller.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ApiErrorHandler {
    private ResponseEntity<Map<String, Object>> respuesta(int status, String mensaje,
            Map<String, String> errores, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fecha", Instant.now().toString());
        body.put("status", status);
        body.put("mensaje", mensaje);
        body.put("ruta", request.getRequestURI());
        body.put("errores", errores);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> api(ApiException ex, HttpServletRequest req) {
        return respuesta(ex.getStatus().value(), ex.getMessage(), Map.of(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex,
            HttpServletRequest req) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errores.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return respuesta(400, "Revisa los campos enviados", errores, req);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, Object>> formato(Exception ex, HttpServletRequest req) {
        return respuesta(400, "Solicitud inválida: revisa tipos de datos y formato JSON", Map.of(), req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridad(DataIntegrityViolationException ex,
            HttpServletRequest req) {
        return respuesta(409, "Los datos entran en conflicto con un registro existente", Map.of(), req);
    }
}
