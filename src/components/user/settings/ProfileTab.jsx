"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaRegCalendar } from "react-icons/fa";

export default function ProfileTab({ userData, onUpdateProfile }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...userData });
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef();

  // `form` es una copia de la prop: useState solo mira su valor inicial, asi
  // que cuando el perfil termina de cargar (o vuelve del PATCH) el formulario
  // se quedaba con los strings vacios del primer render. Hay que resincronizar.
  useEffect(() => {
    if (edit) return; // no pisar lo que el usuario esta tipeando
    setForm({ ...userData });
    setAvatarPreview(userData.avatar);
  }, [userData, edit]);

  // Tocar cualquier campo entra en edicion: el boton "Editar Perfil" pasa a
  // ser un atajo, no un peaje obligatorio antes de poder escribir.
  function startEdit() {
    if (!edit) setEdit(true);
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    // Solo salimos del modo edicion si el guardado realmente funciono: cerrar
    // el form ante un 409 de email duplicado le haria creer que se guardo.
    const ok = await onUpdateProfile({ ...form, avatar: avatarPreview });
    setSaving(false);
    if (ok !== false) setEdit(false);
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
          {/* readOnly y no disabled: un campo deshabilitado no emite eventos,
              asi que no habria forma de entrar en edicion tocandolo. Con
              readOnly el foco entra, dispara la edicion y el cursor se queda
              donde el usuario hizo clic. */}
          <div className="form-group">
            <label htmlFor="name"><FaUser className="input-icon" />Nombre completo</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange}
              readOnly={!edit} onFocus={startEdit} className={edit ? "" : "is-readonly"} />
          </div>
          <div className="form-group">
            <label htmlFor="email"><FaEnvelope className="input-icon" />Correo electrónico</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange}
              readOnly={!edit} onFocus={startEdit} className={edit ? "" : "is-readonly"} />
          </div>
          <div className="form-group">
            <label htmlFor="phone"><FaPhone className="input-icon" />Teléfono</label>
            <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange}
              readOnly={!edit} onFocus={startEdit} className={edit ? "" : "is-readonly"} />
          </div>
        </div>
        <div className="form-actions">
          {edit ? (
            <>
              <button type="button" className="btn-cancel" onClick={handleCancel} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </>
          ) : (
            <button type="button" className="btn-edit" onClick={() => setEdit(true)}>Editar Perfil</button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
