"use client";
import { motion } from "framer-motion";
import { FaLightbulb, FaLeaf, FaClock } from "react-icons/fa";
import usePolling, { POLL_AGGREGATE } from "@/hooks/usePolling";

const FALLBACK_REC = {
  icon: <FaLeaf />,
  title: "Optimiza tu consumo",
  description:
    "Revisa regularmente el consumo de tus dispositivos para identificar oportunidades de ahorro.",
  impact: "Medio",
  color: "#39ff14",
};

// Funcion PURA: (devices, consumption) -> recomendaciones. No pide datos, no
// toca estado. Antes vivia dentro del useEffect, atada al fetch; separada se
// puede testear sola y se recalcula sin volver a pedir nada.
function buildRecommendations(devices, consumption) {
  const recs = [];

  devices.forEach((device) => {
    const deviceConsumption = parseFloat(device.consumption?.replace(" kWh", "") || 0);
    if (deviceConsumption > 3) {
      recs.push({
        icon: <FaLightbulb />,
        title: `Optimiza ${device.name}`,
        description: `${device.name} está consumiendo ${deviceConsumption.toFixed(2)} kWh. Considera ajustar la configuración.`,
        impact: "Alto",
        color: "#ffa500",
      });
    }
  });

  const offlineDevices = devices.filter((d) => d.status === "offline");
  if (offlineDevices.length > 0) {
    recs.push({
      icon: <FaClock />,
      title: "Verifica dispositivos desconectados",
      description: `${offlineDevices.length} dispositivo(s) están sin conexión. Verifica su estado.`,
      impact: "Medio",
      color: "#00ffff",
    });
  }

  if (consumption.averageDay > 10) {
    recs.push({
      icon: <FaLeaf />,
      title: "Consumo diario elevado",
      description: `Tu promedio diario es ${consumption.averageDay.toFixed(2)} kWh. Considera usar electrodomésticos en horarios valle (10PM - 6AM).`,
      impact: "Alto",
      color: "#39ff14",
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: <FaLeaf />,
      title: "Mantén tus dispositivos eficientes",
      description:
        "Desconecta dispositivos en stand-by para ahorrar hasta 10% de energía.",
      impact: "Bajo",
      color: "#39ff14",
    });
  }

  return recs.slice(0, 3);
}

export default function RecommendationsCard() {
  const { data: devices, error: devicesError } = usePolling("/api/devices", {
    intervalMs: POLL_AGGREGATE,
  });
  const { data: consumption, error: consumptionError } = usePolling(
    "/api/user/consumption",
    { intervalMs: POLL_AGGREGATE }
  );

  // Las recomendaciones son datos DERIVADOS: no necesitan useState propio.
  const recommendations =
    devices && consumption
      ? buildRecommendations(devices, consumption)
      : devicesError || consumptionError
        ? [FALLBACK_REC]
        : [];

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-card">
        <h2>Recomendaciones de Ahorro</h2>
        <p>Cargando recomendaciones...</p>
      </div>
    );
  }

  return (
    <div className="recommendations-card">
      <h2>Recomendaciones de Ahorro</h2>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            className="recommendation-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="rec-icon" style={{ color: rec.color }}>
              {rec.icon}
            </div>
            <div className="rec-content">
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
              <span className={`impact-badge ${rec.impact.toLowerCase()}`}>
                Impacto {rec.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
