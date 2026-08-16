import { motion } from "framer-motion";
import { FaChartLine } from "react-icons/fa";

export default function ConsumptionHistory({ data }) {
    const rows = data ?? [];

    // La altura de cada barra es RELATIVA al pico de la semana.
    //
    // Antes era `Math.min(value * 10, 100)`, que da por sentado que 10 kWh en
    // un dia llena la barra. Un prototipo con un potenciometro mide decimas:
    // 0.12 * 10 = 1.2% de alto, o sea el min-height de 10px. TODAS las barras
    // quedaban planas e iguales. El grafico no estaba roto, estaba mintiendo
    // con una escala que no era la de estos datos.
    const peak = Math.max(0, ...rows.map((item) => item.value || 0));

    return(
        <div className="consumption-history-card">
            <div className="card-header">
                <FaChartLine className="card-icon" />
                <h2>Histórico semanal</h2>
            </div>

            <div className="history-chart">
                {rows.map((item, index) => (
                    <div className="bar-item" key={`${item.day}-${index}`}>
                        <motion.div
                        className="bar"
                        initial={{ height: 0 }}
                        animate={{
                          height: peak > 0
                            ? `${Math.min(100, ((item.value || 0) / peak) * 100)}%`
                            : "0%",
                        }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        >
                        <span className="bar-value">{item.value ?? 0}</span>
                        </motion.div>
                        <span className="bar-label">{item.day}</span>
                    </div>
        ))}
            </div>
        </div>
    )
}
