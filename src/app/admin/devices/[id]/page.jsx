"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaMobileAlt,
  FaMapMarkerAlt,
  FaUser,
  FaBolt,
  FaCircle,
  FaClock,
  FaChartLine,
  FaWifi,
} from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import "@/styles/admin/deviceProfile.scss";

export default function DeviceProfilePage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id;

  const [deviceData, setDeviceData] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular fetch de datos - reemplazar con API real
    setTimeout(() => {
      setDeviceData({
        id: deviceId,
        name: "Aire Acondicionado Principal",
        type: "HVAC",
        location: "Sala de estar",
        status: "online",
        user: "Juan Pérez",
        userId: 1,
        brand: "Samsung",
        model: "WindFree AR12",
        power: "3500W",
        registeredDate: "15 Enero 2024",
        lastActive: "Hace 5 minutos",
        firmwareVersion: "v2.4.1",
      });

      setMetrics({
        currentConsumption: "2.5 kWh",
        todayConsumption: "18.3 kWh",
        monthlyConsumption: "245 kWh",
        monthlyCost: "$38.50",
        averageDaily: "8.2 kWh",
        efficiency: "85%",
      });

      setLoading(false);
    }, 500);
  }, [deviceId]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <SideBarAdmin />
        <main className="main-content">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-header"
        >
          <button className="back-button" onClick={() => router.back()}>
            <FaArrowLeft /> Volver
          </button>
          <h1>Detalles del Dispositivo</h1>
        </motion.div>

        <div className="device-profile-container">
          {/* Información Principal del Dispositivo */}
          <motion.div
            className="device-info-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="device-avatar">
              <FaMobileAlt />
            </div>
            <div className="device-details">
              <h2>{deviceData.name}</h2>
              <div className="detail-row">
                <FaMobileAlt className="icon" />
                <span>
                  {deviceData.type} - {deviceData.brand} {deviceData.model}
                </span>
              </div>
              <div className="detail-row">
                <FaMapMarkerAlt className="icon" />
                <span>{deviceData.location}</span>
              </div>
              <div className="detail-row">
                <FaUser className="icon user-icon" />
                <span
                  className="user-link"
                  onClick={() =>
                    router.push(`/admin/users/${deviceData.userId}`)
                  }
                >
                  {deviceData.user}
                </span>
              </div>
              <div className="detail-row">
                <FaCircle className={`icon status-${deviceData.status}`} />
                <span>
                  {deviceData.status === "online" ? "En línea" : "Desconectado"}
                </span>
              </div>
              <div className="detail-row">
                <FaClock className="icon" />
                <span>{deviceData.lastActive}</span>
              </div>
            </div>
            <div className="device-actions">
              <motion.button
                className="btn-control"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IoIosSettings /> Configurar
              </motion.button>
            </div>
          </motion.div>

          {/* Métricas de Consumo */}
          <motion.div
            className="metrics-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="metric-card">
              <FaBolt className="metric-icon current" />
              <div className="metric-info">
                <h3>{metrics.currentConsumption}</h3>
                <p>Consumo Actual</p>
              </div>
            </div>
            <div className="metric-card">
              <FaChartLine className="metric-icon" />
              <div className="metric-info">
                <h3>{metrics.todayConsumption}</h3>
                <p>Consumo Hoy</p>
              </div>
            </div>
            <div className="metric-card">
              <FaBolt className="metric-icon" />
              <div className="metric-info">
                <h3>{metrics.monthlyConsumption}</h3>
                <p>Consumo Mensual</p>
              </div>
            </div>
            <div className="metric-card">
              <FaChartLine className="metric-icon efficiency" />
              <div className="metric-info">
                <h3>{metrics.efficiency}</h3>
                <p>Eficiencia</p>
              </div>
            </div>
          </motion.div>

          {/* Información Técnica */}
          <motion.div
            className="technical-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-header">
              <h2>Información Técnica</h2>
            </div>
            <div className="technical-grid">
              <div className="tech-item">
                <span className="tech-label">Marca</span>
                <span className="tech-value">{deviceData.brand}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Modelo</span>
                <span className="tech-value">{deviceData.model}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Potencia Nominal</span>
                <span className="tech-value">{deviceData.power}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Firmware</span>
                <span className="tech-value">{deviceData.firmwareVersion}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Fecha de Registro</span>
                <span className="tech-value">{deviceData.registeredDate}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Costo Mensual</span>
                <span className="tech-value highlight">
                  {metrics.monthlyCost}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Estadísticas de Uso */}
          <motion.div
            className="usage-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="section-header">
              <h2>Estadísticas de Uso</h2>
              <button className="export-btn">
                <FaChartLine /> Ver Reportes
              </button>
            </div>
            <div className="usage-stats">
              <div className="stat-box">
                <FaBolt className="stat-icon" />
                <div className="stat-content">
                  <h4>Promedio Diario</h4>
                  <p>{metrics.averageDaily}</p>
                </div>
              </div>
              <div className="stat-box">
                <FaChartLine className="stat-icon" />
                <div className="stat-content">
                  <h4>Consumo del Mes</h4>
                  <p>{metrics.monthlyConsumption}</p>
                </div>
              </div>
              <div className="stat-box">
                <FaWifi className="stat-icon" />
                <div className="stat-content">
                  <h4>Estado de Conexión</h4>
                  <p className="status-text">
                    {deviceData.status === "online"
                      ? "Estable"
                      : "Desconectado"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
