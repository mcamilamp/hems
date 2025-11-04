export default function devicesSection() {
  const devices = [
    { id: 1, name: "Dispositivo A", type: "Sensor", status: "Activo" },
    { id: 2, name: "Dispositivo B", type: "Cámara", status: "Inactivo" },
    { id: 3, name: "Dispositivo C", type: "Termostato", status: "Activo" },
  ];

  return (
    <div className="table-container">
      <h2>Dispositivos registrados</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.name}</td>
              <td>{device.type}</td>
              <td>{device.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
