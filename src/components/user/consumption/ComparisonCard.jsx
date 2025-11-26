import { FaBalanceScale } from "react-icons/fa";
export default function ComparisonCard({ userKwh, avgKwh }) {
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
        <div
          className="user-bar"
          style={{
            width: `${Math.min((userKwh / avgKwh) * 100, 100)}%`,
          }}
        />
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
