"use client";
import { useState } from "react";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userAlerts.scss";
import AlertCard from "@/components/user/alerts/AlertCard";
import AlertFilters from "@/components/user/alerts/AlertFilters";
import { motion } from "framer-motion";

const mockAlerts = [
  {
    id: 1,
    title: "Consumo inusual en Aire Acondicionado",
    description: "Se detectó un consumo 40% mayor al habitual en el aire acondicionado.",
    device: "Aire Acondicionado Principal",
    type: "consumo",
    level: "alta",
    date: "2025-11-24 19:15",
    read: false,
  },
  {
    id: 2,
    title: "Dispositivo desconectado",
    description: "El microondas está sin conexión desde hace más de 2 horas.",
    device: "Microondas",
    type: "conexion",
    level: "media",
    date: "2025-11-23 16:30",
    read: false,
  },
  {
    id: 3,
    title: "Mantenimiento sugerido",
    description: "Tu calentador de agua lleva 6 meses sin mantenimiento.",
    device: "Calentador de Agua",
    type: "mantenimiento",
    level: "baja",
    date: "2025-11-21 09:30",
    read: true,
  },
  {
    id: 4,
    title: "Consumo óptimo en Refrigerador",
    description: "Buen trabajo, tu consumo esta semana bajó un 12%.",
    device: "Refrigerador",
    type: "consumo",
    level: "info",
    date: "2025-11-19 11:45",
    read: true,
  },
];

export default function UserAlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filterType, setFilterType] = useState("todas");
  const [filterLevel, setFilterLevel] = useState("todas");
  const [showRead, setShowRead] = useState("todas");

  // Filtro por tipo/nivel/leídas
  const filteredAlerts = alerts.filter((a) => {
    const typeOk = filterType === "todas" || a.type === filterType;
    const levelOk = filterLevel === "todas" || a.level === filterLevel;
    const readOk =
      showRead === "todas" ||
      (showRead === "nuevas" && !a.read) ||
      (showRead === "leidas" && a.read);
    return typeOk && levelOk && readOk;
  });

  // Marcar como leída
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
      </main>
    </div>
  );
}
