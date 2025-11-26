"use client";
import { useState } from "react";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userConsumption.scss";
import ConsumptionHistory from "@/components/user/consumption/ConsumptionHistory";
import DeviceBreakdown from "@/components/user/consumption/DeviceBreakdown";
import ComparisonCard from "@/components/user/consumption/ComparisonCard";
import { motion } from "framer-motion";

export default function UserConsumptionPage() {
  const [totalMonth, setTotalMonth] = useState(245.2);
  const [totalCost, setTotalCost] = useState(38.7);    
  const [averageDay, setAverageDay] = useState(8.2);

  const history = [
    { day: "Lun", value: 9.0 },
    { day: "Mar", value: 8.7 },
    { day: "Mié", value: 7.9 },
    { day: "Jue", value: 8.4 },
    { day: "Vie", value: 9.4 },
    { day: "Sáb", value: 7.2 },
    { day: "Dom", value: 6.8 },
  ];

  const breakdown = [
    { device: "Aire Acondicionado", percentage: 38, kwh: 93 },
    { device: "Refrigerador", percentage: 22, kwh: 54 },
    { device: "Calentador de Agua", percentage: 18, kwh: 44 },
    { device: "Otros", percentage: 22, kwh: 54 },
  ];

  return (
    <div className="user-dashboard">
        <SidebarUser />
        <main className="main-content">
          {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <h1>Consumo Energético</h1>
            <p className="subtitle">Revisa tu consumo, compara y optimiza tu energía</p>
          </div>
        </motion.div>  

        {/* Quick Metrics */}
        <div className="quick-metrics">
          <div className="metric-card">
            <span className="metric-label">Consumo mensual</span>
            <span className="metric-value">{totalMonth} kWh</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Costo estimado</span>
            <span className="metric-value">${totalCost}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Promedio diario</span>
            <span className="metric-value">{averageDay} kWh</span>
          </div>
        </div>

        {/* Gráfica y desglose */}
        <div className="consumption-grid">
          <ConsumptionHistory data={history} />
          <DeviceBreakdown breakdown={breakdown} />
          <ComparisonCard userKwh={totalMonth} avgKwh={310} />
        </div>
        </main>
    </div>
  )
}
