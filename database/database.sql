CREATE DATABASE IF NOT EXISTS taller_db;

USE taller_db;

CREATE TABLE perfiles (
    id_perfil INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    estado BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id_perfil)
);

CREATE TABLE usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    estado BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil)
);

CREATE TABLE vehiculos (
    id_vehiculo INT NOT NULL AUTO_INCREMENT,
    placa VARCHAR(15) NOT NULL,
    marca VARCHAR(40) NOT NULL,
    modelo VARCHAR(40) NOT NULL,
    propietario VARCHAR(100) NOT NULL,
    telefono_propietario VARCHAR(20) NOT NULL,
    estado BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id_vehiculo)
);

CREATE TABLE servicios (
    id_servicio INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    estado BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id_servicio)
);

CREATE TABLE ordenes_servicio (
    id_orden INT NOT NULL AUTO_INCREMENT,
    id_vehiculo INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_entrega DATE,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado_orden VARCHAR(30) NOT NULL,
    estado BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id_orden),
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_orden (
    id_detalle_orden INT NOT NULL AUTO_INCREMENT,
    id_orden INT NOT NULL,
    id_servicio INT NOT NULL,
    precio_aplicado DECIMAL(10,2) NOT NULL,
    observaciones VARCHAR(200),
    estado BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id_detalle_orden),
    FOREIGN KEY (id_orden) REFERENCES ordenes_servicio(id_orden),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);