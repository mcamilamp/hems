"use client";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaEye, FaMobileAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function TableDevices({ devices = [], onEdit, onDelete }) {
  const router = useRouter();

  const handleViewDevice = (deviceId) => {
    router.push(`/admin/devices/${deviceId}`);
  };

  const getDeviceIcon = (type) => {
    return <FaMobileAlt />;
  };

  return (
    <div className="table-devicesPage">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dispositivo</th>
            <th>Tipo</th>
            <th>Ubicación</th>
            <th>Usuario</th>
            <th>Consumo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((device, index) => (
            <motion.tr
              key={device.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <td>#{device.id.toString().padStart(3, "0")}</td>
              <td>
                <div className="device-name-cell">
                  <span className="device-icon">
                    {getDeviceIcon(device.type)}
                  </span>
                  <span
                    className="clickable-name"
                    onClick={() => handleViewDevice(device.id)}
                  >
                    {device.name}
                  </span>
                </div>
              </td>
              <td>
                <span className="device-type-badge">{device.type}</span>
              </td>
              <td>{device.location}</td>
              <td>
                <span
                  className="user-link"
                  onClick={() => router.push(`/admin/users/${device.userId}`)}
                >
                  {device.user}
                </span>
              </td>
              <td>
                <span className="consumption-value">{device.consumption}</span>
              </td>
              <td>
                <span
                  className={
                    device.status === "online"
                      ? "status-online"
                      : "status-offline"
                  }
                >
                  {device.status === "online" ? "En línea" : "Desconectado"}
                </span>
              </td>
              <td>
                <div className="btn-sec">
                  <motion.button
                    className="btn-view"
                    onClick={() => handleViewDevice(device.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Ver detalles"
                  >
                    <FaEye />
                  </motion.button>
                  <motion.button
                    className="btn-edit"
                    onClick={() => onEdit(device)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Editar"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    className="btn-delete"
                    onClick={() => onDelete(device.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
