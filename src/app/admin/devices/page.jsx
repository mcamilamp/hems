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

export default function DevicesPage() {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "Aire Acondicionado Principal",
      type: "HVAC",
      location: "Sala de estar",
      status: "online",
      consumption: "2.5 kWh",
      user: "Juan Pérez",
      userId: 1,
    },
    {
      id: 2,
      name: "Refrigerador",
      type: "Electrodoméstico",
      location: "Cocina",
      status: "online",
      consumption: "1.2 kWh",
      user: "María Gómez",
      userId: 2,
    },
    {
      id: 3,
      name: "Lavadora",
      type: "Electrodoméstico",
      location: "Lavandería",
      status: "offline",
      consumption: "0 kWh",
      user: "Carlos López",
      userId: 3,
    },
    {
      id: 4,
      name: "Calentador de Agua",
      type: "HVAC",
      location: "Baño Principal",
      status: "online",
      consumption: "3.8 kWh",
      user: "Juan Pérez",
      userId: 1,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const handleAddDevice = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleDeleteDevice = (deviceId) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este dispositivo?")
    ) {
      setDevices(devices.filter((device) => device.id !== deviceId));
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingDevice) {
      setDevices(
        devices.map((device) =>
          device.id === editingDevice.id ? { ...device, ...formData } : device
        )
      );
    } else {
      const newDevice = {
        id: devices.length + 1,
        ...formData,
      };
      setDevices([...devices, newDevice]);
    }
    setIsModalOpen(false);
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
            <TableDevices
              devices={devices}
              onEdit={handleEditDevice}
              onDelete={handleDeleteDevice}
            />
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
