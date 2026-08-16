"use client";
import { motion } from "framer-motion";
import "@/styles/admin/admin.scss";
import "@/styles/admin/devicesPage.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import TableDevices from "@/components/admin/devicesPage/tableDevices";
import HeaderDevices from "@/components/admin/devicesPage/headerDevices";
import Modal from "@/components/admin/devicesPage/ModalDevice";
import DeviceForm from "@/components/admin/devicesPage/DeviceForm";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import usePolling, { POLL_AGGREGATE } from "@/hooks/usePolling";

const toRow = (d) => ({
  ...d,
  user: d.user?.name || "Sin asignar",
  userId: d.userId || d.user?.id || null,
  consumption: d.consumption || "0 kWh",
});

export default function DevicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  // /api/devices suma consumo sobre -1h: cadencia lenta alcanza. `refetch`
  // es lo que usan las mutaciones para no duplicar el fetch.
  const { data, loading, refetch: refetchDevices } = usePolling("/api/devices", {
    intervalMs: POLL_AGGREGATE,
    transform: (rows) => rows.map(toRow),
  });
  const devices = data ?? [];

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
        refetchDevices();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const submitData = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        status: formData.status,
        userId: formData.userId,
      };

      if (editingDevice) {
        await axios.patch(`/api/devices/${editingDevice.id}`, submitData);
        toast.success("Dispositivo actualizado");
      } else {
        await axios.post("/api/devices", submitData);
        toast.success("Dispositivo creado");
      }
      setIsModalOpen(false);
      refetchDevices();
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
