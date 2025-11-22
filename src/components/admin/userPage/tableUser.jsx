"use client";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function TableUser({ users = [], onEdit, onDelete }) {
  const router = useRouter();

  const handleViewProfile = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div className="table-userPage">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map(({ id, name, email, role, status }, index) => (
            <motion.tr
              key={id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <td>{id.toString().padStart(3, "0")}</td>
              <td>
                <span
                  className="clickable-name"
                  onClick={() => handleViewProfile(id)}
                >
                  {name}
                </span>
              </td>
              <td>{email}</td>
              <td>
                <span
                  style={{
                    color:
                      role === "Administrador"
                        ? "#00ffff"
                        : "rgba(255, 255, 255, 0.8)",
                    fontWeight: role === "Administrador" ? "600" : "400",
                  }}
                >
                  {role}
                </span>
              </td>
              <td>
                <span
                  className={
                    status === "Activo" ? "status-active" : "status-inactive"
                  }
                >
                  {status}
                </span>
              </td>
              <td>
                <div className="btn-sec">
                  <motion.button
                    className="btn-view"
                    onClick={() => handleViewProfile(id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Ver perfil"
                  >
                    <FaEye />
                  </motion.button>
                  <motion.button
                    className="btn-edit"
                    onClick={() => onEdit({ id, name, email, role, status })}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Editar"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    className="btn-delete"
                    onClick={() => onDelete(id)}
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
