"use client";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

export default function DeviceFilters ({
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
}) {
    const types = [
    { value: "all", label: "Todos" },
    { value: "HVAC", label: "Climatización" },
    { value: "Electrodoméstico", label: "Electrodomésticos" },
    { value: "Electrónico", label: "Electrónicos" },
  ];

  const statuses = [
    { value: "all", label: "Todos" },
    { value: "on", label: "Encendidos" },
    { value: "off", label: "Apagados" },
    { value: "online", label: "En línea" },
    { value: "offline", label: "Desconectados" },
  ];

  return (
    <motion.div
      className="filters-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
        <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar dispositivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="filter-group">
            <label>Tipo:</label>
            <div className="filter-buttons">
                {types.map((type) => (
                    <button
                    key={type.value}
                    className={`filter-btn ${
                        filterType === type.value ? "active" : ""
                    }`}
                    onClick={() => setFilterType(type.value)}
                    >
                    {type.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="filter-group">
            <label>Estado:</label>
        <div className="filter-buttons">
          {statuses.map((status) => (
            <button
              key={status.value}
              className={`filter-btn ${
                filterStatus === status.value ? "active" : ""
              }`}
              onClick={() => setFilterStatus(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
        </div>
    </motion.div>
  )
}