"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaCircle,
  FaMobileAlt,
  FaChartLine,
  FaBolt,
  FaClock,
} from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import "@/styles/admin/userProfile.scss";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [userData, setUserData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular fetch de datos - reemplazar con API real
    setTimeout(() => {
      setUserData({
        id: userId,
        name: "Juan Pérez",
        email: "juan@gmail.com",
        role: "Administrador",
        status: "Activo",
        avatar: null,
        joinedDate: "15 Enero 2024",
        lastActive: "Hace 2 horas",
      });

      setDevices([
        {
          id: 1,
          name: "Aire Acondicionado Principal",
          type: "HVAC",
          status: "online",
          consumption: "2.5 kWh",
          location: "Sala de estar",
        },
        {
          id: 2,
          name: "Refrigerador",
          type: "Electrodoméstico",
          status: "online",
          consumption: "1.2 kWh",
          location: "Cocina",
        },
        {
          id: 3,
          name: "Lavadora",
          type: "Electrodoméstico",
          status: "offline",
          consumption: "0 kWh",
          location: "Lavandería",
        },
      ]);

      setMetrics({
        totalDevices: 3,
        activeDevices: 2,
        totalConsumption: "3.7 kWh",
        monthlyCost: "$45.50",
        savingsPercentage: 23,
      });

      setLoading(false);
    }, 500);
  }, [userId]);

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
          <h1>Perfil de Usuario</h1>
        </motion.div>

        <div className="profile-container">
          {/* Información del Usuario */}
          <motion.div
            className="user-info-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <h2>{userData.name}</h2>
              <div className="detail-row">
                <FaEnvelope className="icon" />
                <span>{userData.email}</span>
              </div>
              <div className="detail-row">
                <FaShieldAlt className="icon" />
                <span>{userData.role}</span>
              </div>
              <div className="detail-row">
                <FaCircle
                  className={`icon status-${userData.status.toLowerCase()}`}
                />
                <span>{userData.status}</span>
              </div>
              <div className="detail-row">
                <FaClock className="icon" />
                <span>{userData.lastActive}</span>
              </div>
            </div>
          </motion.div>

          {/* Métricas */}
          <motion.div
            className="metrics-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="metric-card">
              <FaMobileAlt className="metric-icon" />
              <div className="metric-info">
                <h3>{metrics.totalDevices}</h3>
                <p>Total Dispositivos</p>
              </div>
            </div>
            <div className="metric-card">
              <FaCircle className="metric-icon active" />
              <div className="metric-info">
                <h3>{metrics.activeDevices}</h3>
                <p>Dispositivos Activos</p>
              </div>
            </div>
            <div className="metric-card">
              <FaBolt className="metric-icon" />
              <div className="metric-info">
                <h3>{metrics.totalConsumption}</h3>
                <p>Consumo Total</p>
              </div>
            </div>
            <div className="metric-card">
              <FaChartLine className="metric-icon" />
              <div className="metric-info">
                <h3>{metrics.savingsPercentage}%</h3>
                <p>Ahorro Energético</p>
              </div>
            </div>
          </motion.div>

          {/* Dispositivos */}
          <motion.div
            className="devices-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-header">
              <h2>Dispositivos Asociados</h2>
              <button className="add-device-btn">
                <IoIosSettings /> Gestionar
              </button>
            </div>
            <div className="devices-grid">
              {devices.map((device, index) => (
                <motion.div
                  key={device.id}
                  className={`device-card ${device.status}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="device-header">
                    <FaMobileAlt className="device-icon" />
                    <span className={`status-badge ${device.status}`}>
                      {device.status === "online" ? "En línea" : "Desconectado"}
                    </span>
                  </div>
                  <h3>{device.name}</h3>
                  <p className="device-type">{device.type}</p>
                  <div className="device-stats">
                    <div className="stat">
                      <FaBolt className="stat-icon" />
                      <span>{device.consumption}</span>
                    </div>
                    <div className="stat">
                      <span className="location">{device.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
