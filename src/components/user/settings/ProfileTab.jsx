"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaRegCalendar } from "react-icons/fa";

export default function ProfileTab({ userData, onUpdateProfile }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...userData });
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar);
  const fileInput = useRef();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onUpdateProfile({ ...form, avatar: avatarPreview });
    setEdit(false);
  }

  function handleCancel() {
    setForm({ ...userData });
    setAvatarPreview(userData.avatar);
    setEdit(false);
  }

  return (
    <motion.div className="profile-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      {/* Avatar Section */}
      <div className="avatar-section">
        <div className="avatar-container">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder"><FaUser /></div>
          )}
          {edit && (
            <label className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInput}
                onChange={handleAvatar}
              />
              <FaCamera />
            </label>
          )}
        </div>
        <div className="avatar-info">
          <h2>{userData.name}</h2>
          <p className="role">{userData.role}</p>
          <span className="registered">
            <FaRegCalendar /> Registrada: {userData.registeredDate}
          </span>
        </div>
      </div>
      {/* Profile Form */}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-group">
            <label htmlFor="name"><FaUser className="input-icon" />Nombre completo</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} disabled={!edit} />
          </div>
          <div className="form-group">
            <label htmlFor="email"><FaEnvelope className="input-icon" />Correo electrónico</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} disabled={!edit} />
          </div>
          <div className="form-group">
            <label htmlFor="phone"><FaPhone className="input-icon" />Teléfono</label>
            <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} disabled={!edit} />
          </div>
        </div>
        <div className="form-actions">
          {edit ? (
            <>
              <button type="button" className="btn-cancel" onClick={handleCancel}>Cancelar</button>
              <button type="submit" className="btn-save">Guardar Cambios</button>
            </>
          ) : (
            <button type="button" className="btn-edit" onClick={() => setEdit(true)}>Editar Perfil</button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
