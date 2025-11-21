import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";
import "../../../styles/components/admin/userForm.scss";

// Componente Select Personalizado
function CustomSelect({ label, value, onChange, options, name }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  // Cerrar al hacer click fuera
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
  const [formData, setFormData] = useState({
    name: initialData ? initialData.name : "",
    email: initialData ? initialData.email : "",
    role: initialData ? initialData.role : "Usuario",
    status: initialData ? initialData.status : "Activo",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
    });

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
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
          {initialData ? "Actualizar" : "Crear Usuario"}
        </motion.button>
      </div>
    </form>
  );
}
