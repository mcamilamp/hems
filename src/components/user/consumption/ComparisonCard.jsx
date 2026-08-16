import { FaBalanceScale } from "react-icons/fa";
export default function ComparisonCard({ userKwh, avgKwh }) {
  // Sin el guard, un avgKwh de 0 da Infinity o NaN y el ancho se vuelve
  // basura. Nunca dividas por un prop sin preguntarle si es cero.
  const share =
    avgKwh > 0 ? Math.min(100, Math.max(0, (userKwh / avgKwh) * 100)) : 0;

  return (
    <div className="comparison-card">
      <div className="card-header">
        <FaBalanceScale className="card-icon" />
        <h2>Comparativa</h2>
      </div>
      <div className="comparison-info">
        <div className="user">
          <span className="label">Tu consumo</span>
          <span className="value">{userKwh} kWh</span>
        </div>
        <div className="average">
          <span className="label">Promedio nacional</span>
          <span className="value">{avgKwh} kWh</span>
        </div>
      </div>
      <div className="comparison-bar">
        <div className="user-bar" style={{ width: `${share}%` }} />
        <div className="avg-marker" style={{ left: "100%" }} />
      </div>
      <p className="comparison-desc">
        {userKwh < avgKwh
          ? "¡Estás por debajo del promedio, buen trabajo!"
          : "Tu consumo supera el promedio. Revisa tus hábitos y sigue ahorrando."}
      </p>
    </div>
  );
}
