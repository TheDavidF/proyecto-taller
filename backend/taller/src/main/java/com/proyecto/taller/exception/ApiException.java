package com.proyecto.taller.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    public ApiException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }
    public HttpStatus getStatus() { return status; }
    public static ApiException noEncontrado(String recurso) {
        return new ApiException(HttpStatus.NOT_FOUND, recurso + " no encontrado");
    }
    public static ApiException conflicto(String mensaje) {
        return new ApiException(HttpStatus.CONFLICT, mensaje);
    }
    public static ApiException invalido(String mensaje) {
        return new ApiException(HttpStatus.BAD_REQUEST, mensaje);
    }
}
