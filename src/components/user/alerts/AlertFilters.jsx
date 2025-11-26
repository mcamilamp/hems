"use client";
import { FaFilter } from "react-icons/fa";

export default function AlertFilters({
  filterType,
  setFilterType,
  filterLevel,
  setFilterLevel,
  showRead,
  setShowRead,
}) {
  return (
    <div className="alerts-filters">
      <span className="filter-label"><FaFilter /> Filtrar:</span>
      <select value={filterType} onChange={e => setFilterType(e.target.value)}>
        <option value="todas">Tipos</option>
        <option value="consumo">Consumo</option>
        <option value="conexion">Conexión</option>
        <option value="mantenimiento">Mantenimiento</option>
      </select>
      <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
        <option value="todas">Niveles</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
        <option value="info">Info</option>
      </select>
      <select value={showRead} onChange={e => setShowRead(e.target.value)}>
        <option value="todas">Todas</option>
        <option value="nuevas">Nuevas</option>
        <option value="leidas">Leídas</option>
      </select>
    </div>
  );
}
