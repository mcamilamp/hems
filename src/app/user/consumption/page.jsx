"use client";
import { useState, useEffect } from "react";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userConsumption.scss";
import ConsumptionHistory from "@/components/user/consumption/ConsumptionHistory";
import DeviceBreakdown from "@/components/user/consumption/DeviceBreakdown";
import ComparisonCard from "@/components/user/consumption/ComparisonCard";
import { motion } from "framer-motion";
import axios from "axios";

export default function UserConsumptionPage() {
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalCost, setTotalCost] = useState(0);    
  const [averageDay, setAverageDay] = useState(0);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsumption = async () => {
      try {
        const response = await axios.get("/api/user/consumption");
        setTotalMonth(response.data.totalMonth);
        setTotalCost(response.data.totalCost);
        setAverageDay(response.data.averageDay);
        setHistory(response.data.history || []);
        setBreakdown(response.data.breakdown || []);
      } catch (error) {
        console.error("Error fetching consumption:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConsumption();
  }, []);

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
              <h1>Consumo Energético</h1>
              <p className="subtitle">Revisa tu consumo, compara y optimiza tu energía</p>
            </div>
          </motion.div>  

          {loading ? (
            <div className="loading-container"><div className="loader"></div></div>
          ) : (
            <>
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

              <div className="consumption-grid">
                <ConsumptionHistory data={history} />
                <DeviceBreakdown breakdown={breakdown} />
                <ComparisonCard userKwh={totalMonth} avgKwh={310} />
              </div>
            </>
          )}
        </main>
    </div>
  )
}
