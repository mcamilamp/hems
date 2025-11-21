"use client";
import { motion } from "framer-motion";
import "@/styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TableUser from "@/components/admin/userPage/tableUser";
import HeaderUser from "@/components/admin/userPage/headerUser";
import Modal from "@/components/admin/userPage/ModalUser";
import UserForm from "@/components/admin/userPage/UserForm";
import { useState } from "react";

export default function AdminUserPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Juan Pérez",
      email: "a@gmail.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "María Gómez",
      email: "b@gmail.com",
      role: "Usuario",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "c@gmail.com",
      role: "Usuario",
      status: "Activo",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingUser) {
      // Edit existing user
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, ...formData } : user
        )
      );
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...formData,
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Usuarios
        </motion.h1>
        <div className="sections">
          <motion.div
            className="container-user"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HeaderUser totalUsers={users.length} onAddUser={handleAddUser} />
            <TableUser
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </motion.div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <UserForm
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          initialData={editingUser}
        />
      </Modal>
    </div>
  );
}
