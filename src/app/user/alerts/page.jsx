"use client";
import { useState, useEffect } from "react";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userAlerts.scss";
import AlertCard from "@/components/user/alerts/AlertCard";
import AlertFilters from "@/components/user/alerts/AlertFilters";
import { motion } from "framer-motion";
import axios from "axios";

export default function UserAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filterType, setFilterType] = useState("todas");
  const [filterLevel, setFilterLevel] = useState("todas");
  const [showRead, setShowRead] = useState("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAlerts = async () => {
      try {
        const [devicesRes, statsRes] = await Promise.all([
          axios.get("/api/devices"),
          axios.get("/api/stats")
        ]);

        const devices = devicesRes.data;
        const alertsList = [];

        devices.forEach(device => {
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

        setAlerts(alertsList);
      } catch (error) {
        console.error("Error generating alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    generateAlerts();
  }, []);

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
    setAlerts(alerts.map(al => al.id === id ? { ...al, read: true } : al));
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
