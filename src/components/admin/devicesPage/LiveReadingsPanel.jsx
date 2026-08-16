"use client";
import { motion } from "framer-motion";
import { FaBolt, FaWaveSquare, FaPlug } from "react-icons/fa";
import usePolling, { POLL_LIVE } from "@/hooks/usePolling";

function fmt(v, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Number(v).toFixed(digits);
}

function fmtAge(iso) {
  if (!iso) return "Sin datos";
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 0) return "ahora";
  const s = Math.round(ageMs / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m}m`;
  const h = Math.round(m / 60);
  return `hace ${h}h`;
}

export default function LiveReadingsPanel({ deviceId }) {
  // Unico endpoint con magnitudes instantaneas: last() sobre -5m. Es el
  // lugar donde girar el potenciometro se ve de verdad, por eso POLL_LIVE.
  const { data, error } = usePolling(
    deviceId ? `/api/devices/${deviceId}/latest` : null,
    { intervalMs: POLL_LIVE, enabled: Boolean(deviceId) }
  );

  return (
    <motion.div
      className="technical-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="section-header">
        <h2>Lecturas en Vivo</h2>
        <span style={{ fontSize: "0.85rem", color: "#888" }}>
          {data?.lastUpdate
            ? `Última lectura ${fmtAge(data.lastUpdate)}`
            : error
              ? "No se pudieron obtener lecturas en vivo"
              : "Esperando datos…"}
        </span>
      </div>
      <div className="metrics-grid">
        <div className="metric-card">
          <FaWaveSquare className="metric-icon" />
          <div className="metric-info">
            <h3>{fmt(data?.voltageRms, 1)} V</h3>
            <p>Voltaje RMS</p>
          </div>
        </div>
        <div className="metric-card">
          <FaPlug className="metric-icon" />
          <div className="metric-info">
            <h3>{fmt(data?.currentRms, 2)} A</h3>
            <p>Corriente RMS</p>
          </div>
        </div>
        <div className="metric-card">
          <FaBolt className="metric-icon current" />
          <div className="metric-info">
            <h3>{fmt(data?.powerW, 0)} W</h3>
            <p>Potencia Aparente</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
