"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaBolt, FaWaveSquare, FaPlug } from "react-icons/fa";

const POLL_MS = 10000;

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
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const res = await axios.get(`/api/devices/${deviceId}/latest`);
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError("No se pudieron obtener lecturas en vivo");
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [deviceId]);

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
          {data?.lastUpdate ? `Última lectura ${fmtAge(data.lastUpdate)}` : (error ?? "Esperando datos…")}
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
