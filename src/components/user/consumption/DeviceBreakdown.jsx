import { FaBolt } from "react-icons/fa";

export default function DeviceBreakdown({ breakdown }) {
  return (
    <div className="device-breakdown-card">
      <div className="card-header">
        <FaBolt className="card-icon" />
        <h2>Por dispositivo</h2>
      </div>
      <ul className="breakdown-list">
        {breakdown.map((item) => (
          <li key={item.device}>
            <span className="device">{item.device}</span>
            <span className="kwh">{item.kwh} kWh</span>
            <span className="percentage">{item.percentage}%</span>
            <div className="breakdown-bar">
              <div
                className="bar-fill"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
