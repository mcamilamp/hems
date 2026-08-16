"use client";
import { useMemo, useState } from "react";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userAlerts.scss";
import AlertCard from "@/components/user/alerts/AlertCard";
import AlertFilters from "@/components/user/alerts/AlertFilters";
import { motion } from "framer-motion";
import usePolling, { POLL_AGGREGATE } from "@/hooks/usePolling";

// Funcion PURA: estado de los dispositivos -> lista de alertas. Los ids son
// deterministas (`offline-<id>`, `high-<id>`, `low-<id>`), lo que permite
// recordar cuales se leyeron aunque la lista se regenere en cada tick.
function buildAlerts(devices) {
  const alertsList = [];

  devices.forEach((device) => {
    if (device.status === "offline") {
      alertsList.push({
        id: `offline-${device.id}`,
        title: "Dispositivo desconectado",
        description: `${device.name} está sin conexión.`,
        device: device.name,
        type: "conexion",
        level: "media",
        date: new Date().toLocaleString("es-ES"),
        read: false,
      });
    }

    const consumption = parseFloat(device.consumption?.replace(" kWh", "") || 0);
    if (consumption > 5) {
      alertsList.push({
        id: `high-${device.id}`,
        title: "Consumo elevado detectado",
        description: `${device.name} está consumiendo ${consumption.toFixed(2)} kWh, por encima del promedio.`,
        device: device.name,
        type: "consumo",
        level: "alta",
        date: new Date().toLocaleString("es-ES"),
        read: false,
      });
    } else if (consumption > 0 && consumption < 1) {
      alertsList.push({
        id: `low-${device.id}`,
        title: "Consumo eficiente",
        description: `Excelente, ${device.name} está consumiendo de manera eficiente (${consumption.toFixed(2)} kWh).`,
        device: device.name,
        type: "consumo",
        level: "info",
        date: new Date().toLocaleString("es-ES"),
        read: true,
      });
    }
  });

  return alertsList;
}

export default function UserAlertsPage() {
  const [filterType, setFilterType] = useState("todas");
  const [filterLevel, setFilterLevel] = useState("todas");
  const [showRead, setShowRead] = useState("todas");

  // Antes tambien pedia /api/stats y descartaba la respuesta sin usarla.
  // Eso eran 3 queries a Influx al aire; con poll activo serian 3 por tick.
  const { data: devices, loading } = usePolling("/api/devices", {
    intervalMs: POLL_AGGREGATE,
  });

  // "Leida" es estado de UI y no se persiste en el server. Vive aparte de la
  // lista derivada: si compartieran el mismo state, cada tick del poll
  // borraria lo que el usuario acaba de marcar.
  const [readIds, setReadIds] = useState(() => new Set());

  // Memoizado contra `devices` para que el `new Date()` de cada alerta se
  // estampe una vez por lectura y no en cada render.
  const baseAlerts = useMemo(() => (devices ? buildAlerts(devices) : []), [devices]);

  const alerts = useMemo(
    () => baseAlerts.map((a) => (readIds.has(a.id) ? { ...a, read: true } : a)),
    [baseAlerts, readIds]
  );

  const filteredAlerts = alerts.filter((a) => {
    const typeOk = filterType === "todas" || a.type === filterType;
    const levelOk = filterLevel === "todas" || a.level === filterLevel;
    const readOk =
      showRead === "todas" ||
      (showRead === "nuevas" && !a.read) ||
      (showRead === "leidas" && a.read);
    return typeOk && levelOk && readOk;
  });

  const markAsRead = (id) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="user-dashboard">
      <SidebarUser />
      <main className="main-content">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <h1>Alertas y Notificaciones</h1>
            <p className="subtitle">Seguimiento de eventos, consumos y sugerencias en tus dispositivos.</p>
          </div>
        </motion.div>
        <AlertFilters
          filterType={filterType}
          setFilterType={setFilterType}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          showRead={showRead}
          setShowRead={setShowRead}
        />
        {loading ? (
          <div className="loading-container"><div className="loader"></div></div>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} onRead={markAsRead} />
              ))
            ) : (
              <motion.div className="no-alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p>No hay alertas con los filtros seleccionados.</p>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
