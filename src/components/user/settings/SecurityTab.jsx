"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";

export default function SecurityTab({ onChangePassword }) {
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [msg, setMsg] = useState(null);

  function handleChange(e) {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  }
  function toggle(field) {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (passwordData.new.length < 8) setMsg("La nueva contraseña debe tener al menos 8 caracteres");
    else if (passwordData.new !== passwordData.confirm) setMsg("Las contraseñas nuevas no coinciden");
    else {
      setMsg("¡Contraseña actualizada correctamente!");
      setPasswordData({ current: "", new: "", confirm: "" });
      onChangePassword();
    }
  }

  return (
    <motion.div className="security-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="security-section">
        <div className="section-header">
          <FaLock className="section-icon" /> <h3>Cambiar Contraseña</h3>
        </div>
        <form className="password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="current">Contraseña Actual</label>
            <div className="password-input-wrapper">
              <input type={show.current ? "text" : "password"} id="current" name="current" value={passwordData.current} onChange={handleChange} />
              <button type="button" className="toggle-password" onClick={() => toggle("current")}>{show.current ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="new">Nueva Contraseña</label>
            <div className="password-input-wrapper">
              <input type={show.new ? "text" : "password"} id="new" name="new" value={passwordData.new} onChange={handleChange} />
              <button type="button" className="toggle-password" onClick={() => toggle("new")}>{show.new ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirmar Nueva Contraseña</label>
            <div className="password-input-wrapper">
              <input type={show.confirm ? "text" : "password"} id="confirm" name="confirm" value={passwordData.confirm} onChange={handleChange} />
              <button type="button" className="toggle-password" onClick={() => toggle("confirm")}>{show.confirm ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save"><FaShieldAlt /> Actualizar Contraseña</button>
          </div>
          {msg && <div style={{ color: "#39ff14", marginTop: "1rem", fontWeight: 600 }}>{msg}</div>}
        </form>
      </div>
    </motion.div>
  );
}
