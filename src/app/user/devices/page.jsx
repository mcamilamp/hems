"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userDevices.scss";
import DeviceCard from "@/components/user/devices/DeviceCard";
import DeviceFilters from "@/components/user/devices/DeviceFilters";
import DeviceStats from "@/components/user/devices/DeviceStats";
import {
  FaPlusCircle,
  FaSnowflake,
  FaTemperatureLow,
  FaTv,
  FaTshirt,
  FaShower,
  FaBlender,
  FaRegQuestionCircle,
} from "react-icons/fa";

const deviceIconPatterns = [
  { type: "HVAC", name: /aire/i, icon: <FaTemperatureLow /> },
  { type: "HVAC", name: /calentador/i, icon: <FaShower /> },
  { type: "Electrodoméstico", name: /refrigerador/i, icon: <FaSnowflake /> },
  { type: "Electrodoméstico", name: /lavadora/i, icon: <FaTshirt /> },
  { type: "Electrodoméstico", name: /microondas/i, icon: <FaBlender /> },
  { type: "Electrónico", name: /tv|televisor/i, icon: <FaTv /> },
];

function getDeviceIcon(device) {
  const found = deviceIconPatterns.find(
    (pattern) => pattern.type === device.type && pattern.name.test(device.name)
  );
  return found ? found.icon : <FaRegQuestionCircle />;
}

export default function UserDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get("/api/devices");
        // Transform API data to UI model
        const apiDevices = response.data.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          location: d.location || "Sin ubicación",
          status: d.status,
          isOn: d.status === "online",
          currentConsumption: d.consumption || "0 kWh",
          todayConsumption: "0 kWh", // Not yet in API summary
          temperature: 22, // Mock
        }));
        setDevices(apiDevices);
      } catch (error) {
        console.error("Error fetching devices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

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
    // Mock toggle for UI responsiveness
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
        (sum, d) => sum + parseFloat(d.currentConsumption.replace(" kWh", "") || 0),
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

        {loading ? (
          <div className="loading-container"><div className="loader"></div></div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
