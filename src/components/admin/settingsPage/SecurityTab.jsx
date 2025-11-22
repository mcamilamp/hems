"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";

export default function SecurityTab({ onChangePassword, onLogout }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Calculate password strength for new password
    if (name === "newPassword") {
      calculatePasswordStrength(value);
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onChangePassword(passwordData);
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#ff4b4b";
    if (passwordStrength < 70) return "#ffa500";
    return "#39ff14";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Débil";
    if (passwordStrength < 70) return "Media";
    return "Fuerte";
  };

  return (
    <motion.div
      className="security-tab"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Change Password Section */}
      <div className="security-section">
        <div className="section-header">
          <FaLock className="section-icon" />
          <h3>Cambiar Contraseña</h3>
        </div>

        <form className="password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Contraseña Actual</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className={errors.currentPassword ? "error" : ""}
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "error" : ""}
                placeholder="Ingresa tu nueva contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordData.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getStrengthColor(),
                    }}
                  />
                </div>
                <span style={{ color: getStrengthColor() }}>
                  {getStrengthText()}
                </span>
              </div>
            )}
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-actions">
            <motion.button
              type="submit"
              className="btn-save"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShieldAlt /> Actualizar Contraseña
            </motion.button>
          </div>
        </form>
      </div>

      {/* Logout Section */}
      <div className="security-section logout-section">
        <div className="section-header">
          <FaSignOutAlt className="section-icon" />
          <h3>Cerrar Sesión</h3>
        </div>
        <p className="logout-description">
          Cierra tu sesión de forma segura en este dispositivo.
        </p>
        <motion.button
          className="btn-logout"
          onClick={onLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaSignOutAlt /> Cerrar Sesión
        </motion.button>
      </div>
    </motion.div>
  );
}
