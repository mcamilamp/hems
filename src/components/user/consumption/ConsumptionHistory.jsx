import { motion } from "framer-motion";
import { FaChartLine } from "react-icons/fa";

export default function ConsumptionHistory({ data }) {
    return(
        <div className="consumption-history-card">
            <div className="card-header">
                <FaChartLine className="card-icon" />
                <h2>Histórico semanal</h2>
            </div>

            <div className="history-chart">
                {data.map((item, index) => (
                    <div className="bar-item" key={item.day}>
                        <motion.div
                        className="bar"
                        initial={{ height: 0 }}
                        animate={{ height: `${item.value * 10}%` }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        >
                        <span className="bar-value">{item.value}</span>
                        </motion.div>
                        <span className="bar-label">{item.day}</span>
                    </div>
        ))}
            </div>
        </div>
    )
}