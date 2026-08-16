"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

/*
 * usePolling — un solo lugar donde vive la logica de "volver a preguntar".
 *
 * HTTP es pull: el server no puede avisar que llego un dato. Hasta que
 * exista SSE en el proyecto, la unica forma de que una vista se mantenga
 * fresca es preguntar de nuevo. Este hook centraliza ese "de nuevo" para
 * que no haya seis setInterval copiados con seis cadencias distintas y
 * seis cleanups que alguien se va a olvidar de escribir.
 *
 * Devuelve `refetch` para que las mutaciones (crear/borrar/togglear)
 * fuercen una relectura sin duplicar el fetch.
 */

// Las cadencias se eligen por la NATURALEZA del dato, no por gusto.
//
// POLL_LIVE   -> magnitudes instantaneas (W, A, V). Cambian al girar la
//                perilla, asi que vale la pena preguntar seguido.
// POLL_AGGREGATE -> acumulados de 1 h / 7 d / 30 d. Un delta de 2 s es
//                ruido dentro de una suma de 30 dias: preguntar cada 3 s
//                seria quemar queries a Influx para ver el mismo numero.
export const POLL_LIVE = 3000;
export const POLL_AGGREGATE = 30000;

export default function usePolling(url, options = {}) {
  const { intervalMs = POLL_AGGREGATE, transform, enabled = true } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // `transform` casi siempre llega como arrow inline desde la vista. Si
  // entrara al array de dependencias cambiaria de identidad en cada render
  // y el intervalo se remontaria para siempre. Por eso viaja en un ref.
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Separa la PRIMERA carga de los ticks siguientes. Sin esto `loading`
  // volveria a true en cada tick y el loader parpadearia cada 3 segundos.
  const settledRef = useRef(false);
  const aliveRef = useRef(true);

  // Numero de secuencia: con poll agresivo y una query lenta a Influx dos
  // requests pueden volver desordenadas y la vieja pisar a la nueva. Solo
  // se escribe el resultado de la ultima emitida.
  const seqRef = useRef(0);

  const fetchNow = useCallback(async () => {
    if (!url || !enabled) return;

    const seq = ++seqRef.current;
    const isCurrent = () => aliveRef.current && seq === seqRef.current;

    try {
      const res = await axios.get(url);
      if (!isCurrent()) return;
      const apply = transformRef.current;
      setData(apply ? apply(res.data) : res.data);
      setError(null);
    } catch (e) {
      if (!isCurrent()) return;
      // Se loguea aca y no en cada vista: un poll que falla no debe
      // disparar un toast, porque a 30 s serian toasts para siempre.
      // Pero tampoco puede fallar en silencio.
      console.error(`usePolling: fallo GET ${url}`, e);
      setError(e);
    } finally {
      if (isCurrent() && !settledRef.current) {
        settledRef.current = true;
        setLoading(false);
      }
    }
  }, [url, enabled]);

  useEffect(() => {
    aliveRef.current = true;

    if (!url || !enabled) {
      setLoading(false);
      return () => {
        aliveRef.current = false;
      };
    }

    let timer = null;
    const start = () => {
      if (!timer) timer = setInterval(fetchNow, intervalMs);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    // Una pestaña oculta no necesita datos frescos: pollearla es pagar
    // queries a Influx para nadie. Al volver pedimos YA y reanudamos.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchNow();
        start();
      } else {
        stop();
      }
    };

    fetchNow();
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      aliveRef.current = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [url, intervalMs, enabled, fetchNow]);

  return { data, error, loading, refetch: fetchNow };
}
