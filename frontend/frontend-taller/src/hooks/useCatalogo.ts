import { useEffect, useRef, useState } from "react";
import type { AxiosResponse } from "axios";
import { mensajeError } from "../utils/formato";
interface ApiCatalogo<T, F> {
  listar: (todos: boolean) => Promise<AxiosResponse<T[]>>;
  crear: (datos: F) => Promise<AxiosResponse<T>>;
  actualizar: (id: number, datos: F) => Promise<AxiosResponse<T>>;
  anular: (id: number) => Promise<AxiosResponse<void>>;
  activar: (id: number) => Promise<AxiosResponse<T>>;
}
export function useCatalogo<T extends { estado: boolean }, F>(
  api: ApiCatalogo<T, F>,
  obtenerId: (fila: T) => number,
) {
  const [filas, setFilas] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [version, setVersion] = useState(0);
  const candado = useRef(false);
  useEffect(() => {
    let vigente = true;
    api
      .listar(true)
      .then((r) => {
        if (vigente) {
          setFilas(r.data);
          setErrorCarga(false);
          setError("");
        }
      })
      .catch((e) => {
        if (vigente) {
          setError(mensajeError(e));
          setErrorCarga(true);
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [api, version]);
  function recargar() {
    setCargando(true);
    setVersion((v) => v + 1);
  }
  async function guardar(id: number | null, datos: F) {
    if (candado.current) return false;
    candado.current = true;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      const r =
        id === null ? await api.crear(datos) : await api.actualizar(id, datos);
      setFilas((prev) =>
        id === null
          ? [r.data, ...prev]
          : prev.map((f) => (obtenerId(f) === id ? r.data : f)),
      );
      setMensaje(
        id === null
          ? "Registro creado correctamente."
          : "Registro actualizado correctamente.",
      );
      return true;
    } catch (e) {
      setError(mensajeError(e));
      return false;
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }
  async function cambiarEstado(fila: T) {
    if (candado.current) return;
    const id = obtenerId(fila);
    if (
      !window.confirm(
        `¿Deseas ${fila.estado ? "anular" : "reactivar"} el registro #${id}?`,
      )
    )
      return;
    candado.current = true;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      let actualizado: T;
      if (fila.estado) {
        await api.anular(id);
        actualizado = { ...fila, estado: false };
      } else actualizado = (await api.activar(id)).data;
      setFilas((prev) =>
        prev.map((f) => (obtenerId(f) === id ? actualizado : f)),
      );
      setMensaje(
        fila.estado
          ? "Registro anulado. Se conserva en el historial."
          : "Registro reactivado correctamente.",
      );
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }
  return {
    filas,
    cargando,
    errorCarga,
    ocupado,
    error,
    mensaje,
    setError,
    setMensaje,
    guardar,
    cambiarEstado,
    recargar,
  };
}
