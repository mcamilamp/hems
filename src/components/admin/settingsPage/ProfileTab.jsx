"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
} from "react-icons/fa";

export default function ProfileTab({ adminData, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    name: adminData.name,
    email: adminData.email,
    phone: adminData.phone,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(adminData.avatar);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ ...formData, avatar: avatarPreview });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone,
    });
    setAvatarPreview(adminData.avatar);
    setIsEditing(false);
  };

  return (
    <motion.div
      className="profile-tab"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar Section */}
      <div className="avatar-section">
        <div className="avatar-container">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              <FaUser />
            </div>
          )}
          {isEditing && (
            <label className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <FaCamera />
            </label>
          )}
        </div>
        <div className="avatar-info">
          <h2>{adminData.name}</h2>
          <p className="role">{adminData.role}</p>
          <p className="registered">
            <FaCalendar /> Registrado: {adminData.registeredDate}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información Personal</h3>

          <div className="form-group">
            <label htmlFor="name">
              <FaUser className="input-icon" />
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone className="input-icon" />
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="+57 300 123 4567"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {!isEditing ? (
            <motion.button
              type="button"
              className="btn-edit"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Editar Perfil
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                className="btn-save"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Guardar Cambios
              </motion.button>
            </>
          )}
        </div>
      </form>
    </motion.div>
  );
}
