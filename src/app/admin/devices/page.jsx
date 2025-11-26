"use client";
import { motion } from "framer-motion";
import "@/styles/admin/admin.scss";
import "@/styles/admin/devicesPage.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TableDevices from "@/components/admin/devicesPage/tableDevices";
import HeaderDevices from "@/components/admin/devicesPage/headerDevices";
import Modal from "@/components/admin/devicesPage/ModalDevice";
import DeviceForm from "@/components/admin/devicesPage/DeviceForm";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const fetchDevices = async () => {
    try {
      const response = await axios.get("/api/devices");
      setDevices(response.data.map(d => ({
        ...d,
        user: d.user?.name || "Sin asignar", // Map user object to name for table
        consumption: d.consumption || "0 kWh"
      })));
    } catch (error) {
      toast.error("Error al cargar dispositivos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este dispositivo?")
    ) {
      try {
        await axios.delete(`/api/devices/${deviceId}`);
        toast.success("Dispositivo eliminado");
        fetchDevices();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingDevice) {
        await axios.patch(`/api/devices/${editingDevice.id}`, formData);
        toast.success("Dispositivo actualizado");
      } else {
        await axios.post("/api/devices", formData);
        toast.success("Dispositivo creado");
      }
      setIsModalOpen(false);
      fetchDevices();
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
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
          Dispositivos
        </motion.h1>
        <div className="sections">
          <motion.div
            className="container-devices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HeaderDevices
              totalDevices={devices.length}
              activeDevices={
                devices.filter((d) => d.status === "online").length
              }
              onAddDevice={handleAddDevice}
            />
            {loading ? (
              <div className="loading-container"><div className="loader"></div></div>
            ) : (
              <TableDevices
                devices={devices}
                onEdit={handleEditDevice}
                onDelete={handleDeleteDevice}
              />
            )}
          </motion.div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDevice ? "Editar Dispositivo" : "Nuevo Dispositivo"}
      >
        <DeviceForm
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          initialData={editingDevice}
        />
      </Modal>
    </div>
  );
}
