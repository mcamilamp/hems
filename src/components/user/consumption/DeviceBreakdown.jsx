import { FaBolt } from "react-icons/fa";

// Un ancho en % que llega del server se acota antes de tocar el DOM. La API ya
// lo limita, pero un componente no delega su propia integridad visual: si el
// dato vuelve a corromperse la barra se llena y se queda adentro, no pinta por
// encima de la tarjeta de al lado.
const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export default function DeviceBreakdown({ breakdown }) {
  const rows = breakdown ?? [];

  return (
    <div className="device-breakdown-card">
      <div className="card-header">
        <FaBolt className="card-icon" />
        <h2>Por dispositivo</h2>
      </div>
      <ul className="breakdown-list">
        {rows.map((item, index) => (
          <li key={`${item.device}-${index}`}>
            <div className="breakdown-row">
              <span className="device">{item.device}</span>
              <span className="kwh">{item.kwh} kWh</span>
              <span className="percentage">{clampPercent(item.percentage)}%</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="bar-fill"
                style={{ width: `${clampPercent(item.percentage)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
