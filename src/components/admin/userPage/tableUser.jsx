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
            {["ID", "Nombre", "Email", "Rol", "Estado", "Acciones"].map(
              (header) => (
                <th key={header}>{header}</th>
              )
            )}
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
              <td>{id}</td>
              <td
                className="clickable-name"
                onClick={() => handleViewProfile(id)}
              >
                {name}
              </td>
              <td>{email}</td>
              <td>{role}</td>
              <td
                className={
                  status === "Activo" ? "status-active" : "status-inactive"
                }
              >
                {status}
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
