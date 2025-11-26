"use client";
import { motion } from "framer-motion";
import "@/styles/admin/admin.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TableUser from "@/components/admin/userPage/tableUser";
import HeaderUser from "@/components/admin/userPage/headerUser";
import Modal from "@/components/admin/userPage/ModalUser";
import UserForm from "@/components/admin/userPage/UserForm";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data.map(u => ({
        ...u,
        status: "Activo",
        role: u.role === 'admin' ? 'Administrador' : 'Usuario'
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      toast.error("Función de eliminar usuario no implementada en API por seguridad");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingUser) {
        toast.error("Edición de usuarios no implementada");
      } else {
        const response = await axios.post("/api/users", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        toast.success("Usuario creado exitosamente");
        fetchUsers();
      }
      setIsModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al crear usuario";
      toast.error(errorMessage);
      console.error(error);
    }
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
            {loading ? (
              <div className="loading-container"><div className="loader"></div></div>
            ) : (
              <TableUser
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            )}
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
