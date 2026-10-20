package com.proyecto.taller;

import java.net.URI;
import java.net.http.*;
import java.math.BigDecimal;
import java.time.Duration;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import com.proyecto.taller.repository.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiIntegrationTests {
    @LocalServerPort int port;
    @Autowired OrdenServicioRepository ordenes;
    @Autowired DetalleOrdenRepository detalles;
    @Autowired UsuarioRepository usuarios;
    @Autowired PerfilRepository perfiles;
    @Autowired VehiculoRepository vehiculos;
    @Autowired ServicioRepository servicios;
    final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach void limpiar() {
        detalles.deleteAll(); ordenes.deleteAll(); usuarios.deleteAll();
        perfiles.deleteAll(); vehiculos.deleteAll(); servicios.deleteAll();
    }
    HttpResponse<String> request(String method, String path, String body) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api" + path))
            .timeout(Duration.ofSeconds(20)).header("Content-Type", "application/json")
            .method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body))
            .build(), HttpResponse.BodyHandlers.ofString());
    }
    JsonNode ok(String method, String path, String body, int status) throws Exception {
        var response = request(method, path, body);
        assertEquals(status, response.statusCode(), response.body());
        return response.body().isBlank() ? null : mapper.readTree(response.body());
    }
    int crear(String path, String body, String field) throws Exception {
        return ok("POST", path, body, 201).get(field).asInt();
    }
    int perfil() throws Exception { return crear("/perfiles", "{\"nombre\":\"Administrador\"}", "idPerfil"); }
    int usuario(int perfil) throws Exception {
        return crear("/usuarios", "{\"idPerfil\":" + perfil + ",\"nombre\":\"David\",\"usuario\":\"david\",\"contrasena\":\"Clave1234\",\"correo\":\"david@example.com\"}", "idUsuario");
    }
    int vehiculo() throws Exception {
        return crear("/vehiculos", "{\"placa\":\"P123ABC\",\"marca\":\"Toyota\",\"modelo\":\"2020\",\"propietario\":\"David\",\"telefonoPropietario\":\"55555555\"}", "idVehiculo");
    }
    int servicio(String nombre) throws Exception {
        return crear("/servicios", "{\"nombre\":\"" + nombre + "\",\"precioBase\":50}", "idServicio");
    }
    String orden(int v, int u, String items) {
        return "{\"idVehiculo\":" + v + ",\"idUsuario\":" + u + ",\"fechaIngreso\":\"2026-10-19\",\"estadoOrden\":\"PENDIENTE\",\"total\":1,\"detalles\":[" + items + "]}";
    }
    String detalle(int s, String precio) { return "{\"idServicio\":" + s + ",\"precioAplicado\":" + precio + "}"; }

    @Test void catalogosActualizacionAnulacionYErrores() throws Exception {
        int p = perfil();
        ok("PUT", "/perfiles/" + p, "{\"nombre\":\"Mecánico\"}", 200);
        assertEquals("Mecánico", ok("GET", "/perfiles/" + p, null, 200).get("nombre").asText());
        ok("DELETE", "/perfiles/" + p, null, 204);
        assertEquals(0, ok("GET", "/perfiles", null, 200).size());
        assertEquals(1, ok("GET", "/perfiles?incluirInactivos=true", null, 200).size());
        ok("PUT", "/perfiles/" + p + "/activar", null, 200);
        assertEquals(1, ok("GET", "/perfiles", null, 200).size());
        ok("GET", "/perfiles/999999", null, 404);
        assertTrue(ok("POST", "/servicios", "{\"nombre\":\"\",\"precioBase\":-1}", 400).get("errores").has("precioBase"));
        ok("POST", "/servicios", "{", 400);
        ok("GET", "/servicios/no-numero", null, 400);
        int s = servicio("Cambio aceite");
        ok("PUT", "/servicios/" + s, "{\"nombre\":\"Aceite\",\"precioBase\":75}", 200);
        ok("PUT", "/servicios/" + s + "/anular", null, 204);
        assertTrue(servicios.existsById(s));
    }
    @Test void usuarioNuncaExponeClaveYConservaHashAlEditar() throws Exception {
        int p = perfil(); int u = usuario(p);
        assertFalse(ok("GET", "/usuarios/" + u, null, 200).has("contrasena"));
        assertFalse(ok("GET", "/usuarios", null, 200).toString().contains("contrasena"));
        String hash = usuarios.findById(u).orElseThrow().getContrasena();
        assertTrue(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches("Clave1234", hash));
        String update = "{\"idPerfil\":" + p + ",\"nombre\":\"Fernando\",\"usuario\":\"david\",\"correo\":\"f@example.com\"}";
        ok("PUT", "/usuarios/" + u, update, 200);
        assertEquals(hash, usuarios.findById(u).orElseThrow().getContrasena());
        ok("POST", "/usuarios", update, 409);
        ok("POST", "/usuarios", update.replace("david", "otro"), 400);
        ok("DELETE", "/usuarios/" + u, null, 204);
        assertTrue(usuarios.existsById(u));
        ok("PUT", "/usuarios/" + u + "/activar", null, 200);
    }
    @Test void ordenRecalculaTotalConservaDetallesYRevierteErrores() throws Exception {
        int u = usuario(perfil()), v = vehiculo(), s = servicio("Aceite"), s2 = servicio("Frenos");
        JsonNode out = ok("POST", "/ordenes", orden(v, u, detalle(s, "50.25") + "," + detalle(s2, "20")), 201);
        int id = out.get("idOrden").asInt();
        int d = out.get("detalles").get(0).get("idDetalleOrden").asInt();
        assertEquals(0, new BigDecimal("70.25").compareTo(out.get("total").decimalValue()));
        String edit = "{\"idDetalleOrden\":" + d + ",\"idServicio\":" + s + ",\"precioAplicado\":60}";
        JsonNode updated = ok("PUT", "/ordenes/" + id, orden(v, u, edit), 200);
        assertEquals(d, updated.get("detalles").get(0).get("idDetalleOrden").asInt());
        assertEquals(1, detalles.count());
        assertEquals(0, new BigDecimal("60").compareTo(updated.get("total").decimalValue()));
        ok("PUT", "/ordenes/" + id, orden(v, u, detalle(s, "5") + "," + detalle(999999, "1")), 404);
        assertEquals(1, detalles.count());
        assertEquals(0, new BigDecimal("60").compareTo(ok("GET", "/ordenes/" + id, null, 200).get("total").decimalValue()));
        ok("PUT", "/ordenes/" + id, orden(v, u, edit + "," + edit), 400);
        ok("PUT", "/ordenes/" + id, orden(v, u, edit.replace("60", "-1")), 400);
        ok("POST", "/ordenes", orden(v, u, "null"), 400);
        ok("POST", "/ordenes", orden(v, u, ""), 400);
        ok("POST", "/ordenes", orden(v, u, detalle(s, "2")).replace("PENDIENTE", "INVALIDO"), 400);
        ok("POST", "/ordenes", orden(v, u, detalle(s, "2")).replace("\"estadoOrden\"", "\"fechaEntrega\":\"2026-10-18\",\"estadoOrden\""), 400);
        int otra = ok("POST", "/ordenes", orden(v, u, detalle(s2, "10")), 201).get("idOrden").asInt();
        ok("PUT", "/ordenes/" + otra, orden(v, u, edit), 400);
        String inactivo = detalle(s2, "100").replace("}", ",\"estado\":false}");
        JsonNode sinInactivos = ok("PUT", "/ordenes/" + id, orden(v, u, edit + "," + inactivo), 200);
        assertEquals(0, new BigDecimal("60").compareTo(sinInactivos.get("total").decimalValue()));
        long cantidadDetalles = detalles.count();
        ok("DELETE", "/ordenes/" + id, null, 204);
        assertEquals(cantidadDetalles, detalles.count());
        assertEquals(1, ok("GET", "/ordenes", null, 200).size());
        ok("PUT", "/ordenes/" + id + "/activar", null, 200);
        ok("DELETE", "/servicios/" + s, null, 204);
        ok("POST", "/ordenes", orden(v, u, detalle(s, "2")), 409);
    }
    @Test void vehiculoActualizaYRechazaDuplicados() throws Exception {
        int id = vehiculo();
        String body = "{\"placa\":\"P123ABC\",\"marca\":\"Scion\",\"modelo\":\"2010\",\"propietario\":\"Fernando\",\"telefonoPropietario\":\"55555555\"}";
        ok("PUT", "/vehiculos/" + id, body, 200);
        ok("POST", "/vehiculos", body, 409);
        ok("DELETE", "/vehiculos/" + id, null, 204);
        ok("PUT", "/vehiculos/" + id + "/activar", null, 200);
    }
    @Test void corsPermiteOrigenDelFrontend() throws Exception {
        var response = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/servicios"))
            .header("Origin", "http://localhost:5173").header("Access-Control-Request-Method", "POST")
            .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(200, response.statusCode());
        assertEquals("http://localhost:5173", response.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
    }
}
