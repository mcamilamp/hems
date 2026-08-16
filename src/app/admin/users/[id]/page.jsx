"use client";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import usePolling, { POLL_AGGREGATE } from "@/hooks/usePolling";
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

  // /api/users/:id consulta Influx por el consumo de cada dispositivo, asi
  // que esta vista SI muestra telemetria y no puede quedar congelada.
  const { data, loading } = usePolling(
    userId ? `/api/users/${userId}` : null,
    {
      intervalMs: POLL_AGGREGATE,
      enabled: Boolean(userId),
      transform: ({ user, devices, metrics }) => ({
        user,
        metrics,
        devices: devices.map((d) => ({
          ...d,
          consumption: d.consumption || "0 kWh",
          location: d.location || "Sin ubicación",
        })),
      }),
    }
  );

  const userData = data?.user ?? null;
  const devices = data?.devices ?? [];
  const metrics = data?.metrics ?? {};

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

  if (!userData) return <div>Usuario no encontrado</div>;

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
                  className={`icon status-${userData.status?.toLowerCase() || 'active'}`}
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
              <button 
                className="add-device-btn"
                onClick={() => {
                  router.push(`/admin/devices?userId=${userId}`);
                }}
              >
                <IoIosSettings /> Gestionar
              </button>
            </div>
            <div className="devices-grid">
              {devices.length === 0 ? (
                <p>No hay dispositivos asociados.</p>
              ) : (
                devices.map((device, index) => (
                  <motion.div
                    key={device.id}
                    className={`device-card ${device.status}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/admin/devices/${device.id}`)}
                    style={{ cursor: 'pointer' }}
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
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
