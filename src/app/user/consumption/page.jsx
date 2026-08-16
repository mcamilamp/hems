"use client";
import usePolling, { POLL_AGGREGATE } from "@/hooks/usePolling";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userConsumption.scss";
import ConsumptionHistory from "@/components/user/consumption/ConsumptionHistory";
import DeviceBreakdown from "@/components/user/consumption/DeviceBreakdown";
import ComparisonCard from "@/components/user/consumption/ComparisonCard";
import { motion } from "framer-motion";
import TariffNote from "@/components/common/TariffNote";
import { formatCop } from "@/lib/currency";

export default function UserConsumptionPage() {
  // Todo lo de esta vista es historico (-30d, -7d agregado por dia).
  // Cadencia lenta: no hay nada instantaneo que mirar aca.
  const { data, loading } = usePolling("/api/user/consumption", {
    intervalMs: POLL_AGGREGATE,
  });

  const totalMonth = data?.totalMonth ?? 0;
  const totalCost = data?.totalCost ?? 0;
  const averageDay = data?.averageDay ?? 0;
  const history = data?.history ?? [];
  const breakdown = data?.breakdown ?? [];
  const tariff = data?.tariff ?? null;
  const uncoveredKwh = data?.uncoveredKwh ?? 0;

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
                  <span className="metric-label">Costo estimado de energía</span>
                  <span className="metric-value">{formatCop(totalCost)}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Promedio diario</span>
                  <span className="metric-value">{averageDay} kWh</span>
                </div>
              </div>

              <TariffNote tariff={tariff} uncoveredKwh={uncoveredKwh} />

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
