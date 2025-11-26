import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";
import "../../../styles/components/admin/userForm.scss";

function CustomSelect({ label, value, onChange, options, name }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  const handleClickOutside = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper">
      <label>{label}</label>
      <div className="custom-select" onBlur={handleClickOutside}>
        <motion.div
          className="select-header"
          onClick={handleToggle}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span>{value}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <IoChevronDown className="chevron" />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="select-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {options.map((option, index) => (
                <motion.div
                  key={option}
                  className={`select-option ${
                    value === option ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  {option}
                  {value === option && (
                    <motion.div
                      className="check-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function UserForm({ onSubmit, onCancel, initialData = null }) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    name: initialData ? initialData.name : "",
    email: initialData ? initialData.email : "",
    password: "",
    role: initialData ? (initialData.role === "admin" || initialData.role === "Administrador" ? "Administrador" : "Usuario") : "Usuario",
    status: initialData ? initialData.status : "Activo",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "El nombre es obligatorio.";
        if (value.length < 3)
          return "El nombre debe tener al menos 3 caracteres.";
        return "";

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return "El correo electrónico es obligatorio.";
        if (!emailRegex.test(value))
          return "El correo electrónico no es válido.";
        return "";

      case "password":
        if (!isEditMode && !value.trim()) {
          return "La contraseña es obligatoria para nuevos usuarios.";
        }
        if (value && value.length < 6) {
          return "La contraseña debe tener al menos 6 caracteres.";
        }
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === "password" && isEditMode && !formData.password) {
        return; // Password is optional when editing
      }
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: !isEditMode,
    });

    if (Object.keys(newErrors).length === 0) {
      const submitData = { ...formData };
      if (isEditMode && !submitData.password) {
        delete submitData.password; // Don't send empty password on edit
      }
      onSubmit(submitData);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">
          Nombre completo <span className="required">*</span>
        </label>
        <motion.input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name && touched.name ? "error" : ""}
          whileFocus="focus"
          variants={inputVariants}
          placeholder="Ingresa el nombre completo"
        />
        {errors.name && touched.name && (
          <motion.span
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.name}
          </motion.span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Correo electrónico <span className="required">*</span>
        </label>
        <motion.input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email && touched.email ? "error" : ""}
          whileFocus="focus"
          variants={inputVariants}
          placeholder="usuario@ejemplo.com"
          disabled={isEditMode}
        />
        {errors.email && touched.email && (
          <motion.span
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.email}
          </motion.span>
        )}
        {isEditMode && (
          <span style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.25rem" }}>
            El email no se puede modificar
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">
          Contraseña {!isEditMode && <span className="required">*</span>}
          {isEditMode && <span style={{ fontSize: "0.85rem", color: "#888" }}> (dejar vacío para no cambiar)</span>}
        </label>
        <div style={{ position: "relative" }}>
          <motion.input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.password && touched.password ? "error" : ""}
            whileFocus="focus"
            variants={inputVariants}
            placeholder={isEditMode ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#00ffff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {errors.password && touched.password && (
          <motion.span
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.password}
          </motion.span>
        )}
      </div>

      <div className="form-row">
        <CustomSelect
          label="Rol"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={["Usuario", "Administrador"]}
        />

        <CustomSelect
          label="Estado"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={["Activo", "Inactivo"]}
        />
      </div>

      <div className="form-actions">
        <motion.button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancelar
        </motion.button>
        <motion.button
          type="submit"
          className="btn-submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isEditMode ? "Actualizar" : "Crear Usuario"}
        </motion.button>
      </div>
    </form>
  );
}
