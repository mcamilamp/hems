"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userDevices.scss";
import DeviceCard from "@/components/user/devices/DeviceCard";
import DeviceFilters from "@/components/user/devices/DeviceFilters";
import DeviceStats from "@/components/user/devices/DeviceStats";
import { FaPlusCircle, FaSnowflake, FaTemperatureLow, FaTv, FaTshirt, FaShower, FaBlender, FaRegQuestionCircle } from "react-icons/fa";

// Mapeo flexible de iconos por tipo y nombre
const deviceIconPatterns = [
  { type: "HVAC", name: /aire/i,         icon: <FaTemperatureLow /> },
  { type: "HVAC", name: /calentador/i,   icon: <FaShower /> },
  { type: "Electrodoméstico", name: /refrigerador/i, icon: <FaSnowflake /> },
  { type: "Electrodoméstico", name: /lavadora/i,     icon: <FaTshirt /> },
  { type: "Electrodoméstico", name: /microondas/i,   icon: <FaBlender /> },
  { type: "Electrónico", name: /tv|televisor/i,      icon: <FaTv /> },
];
function getDeviceIcon(device) {
  const found = deviceIconPatterns.find(
    (pattern) => pattern.type === device.type && pattern.name.test(device.name)
  );
  return found ? found.icon : <FaRegQuestionCircle />;
}

export default function UserDevicesPage() {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "Aire Acondicionado Principal",
      type: "HVAC",
      location: "Sala de estar",
      status: "online",
      isOn: true,
      currentConsumption: "2.5 kWh",
      todayConsumption: "18.3 kWh",
      temperature: 22,
    },
    {
      id: 2,
      name: "Refrigerador",
      type: "Electrodoméstico",
      location: "Cocina",
      status: "online",
      isOn: true,
      currentConsumption: "1.2 kWh",
      todayConsumption: "28.8 kWh",
    },
    {
      id: 3,
      name: "Lavadora",
      type: "Electrodoméstico",
      location: "Lavandería",
      status: "online",
      isOn: false,
      currentConsumption: "0 kWh",
      todayConsumption: "3.5 kWh",
    },
    {
      id: 4,
      name: "Televisor Smart",
      type: "Electrónico",
      location: "Sala de estar",
      status: "online",
      isOn: true,
      currentConsumption: "0.3 kWh",
      todayConsumption: "2.4 kWh",
    },
    {
      id: 5,
      name: "Calentador de Agua",
      type: "HVAC",
      location: "Baño",
      status: "online",
      isOn: true,
      currentConsumption: "3.8 kWh",
      todayConsumption: "22.5 kWh",
      temperature: 45,
    },
    {
      id: 6,
      name: "Microondas",
      type: "Electrodoméstico",
      location: "Cocina",
      status: "offline",
      isOn: false,
      currentConsumption: "0 kWh",
      todayConsumption: "0.8 kWh",
    },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDevices = devices.filter((device) => {
    const matchesType = filterType === "all" || device.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "on" && device.isOn) ||
      (filterStatus === "off" && !device.isOn) ||
      device.status === filterStatus;
    const matchesSearch = device.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const toggleDevice = (id) => {
    setDevices(
      devices.map((device) =>
        device.id === id ? { ...device, isOn: !device.isOn } : device
      )
    );
  };

  const stats = {
    total: devices.length,
    online: devices.filter((d) => d.status === "online").length,
    active: devices.filter((d) => d.isOn).length,
    totalConsumption: devices
      .reduce(
        (sum, d) => sum + parseFloat(d.currentConsumption.replace(" kWh", "")),
        0
      )
      .toFixed(1),
  };

  return (
    <div className="user-dashboard">
      <SidebarUser />
      <main className="main-content">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <h1>Mis Dispositivos</h1>
            <p className="subtitle">Controla y monitorea tus dispositivos</p>
          </div>
          <motion.button
            className="add-device-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlusCircle /> Agregar Dispositivo
          </motion.button>
        </motion.div>

        <DeviceStats stats={stats} />

        <DeviceFilters
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="devices-grid">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device, index) => (
              <DeviceCard
                key={device.id}
                device={device}
                index={index}
                icon={getDeviceIcon(device)}
                onToggle={toggleDevice}
              />
            ))
          ) : (
            <motion.div
              className="no-devices"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No se encontraron dispositivos con esos filtros</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
