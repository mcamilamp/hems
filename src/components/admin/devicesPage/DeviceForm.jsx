import { useState } from "react";
import { motion } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";
import "../../../styles/components/admin/deviceForm.scss";

// Componente Select Personalizado
function CustomSelect({ label, value, onChange, options, name }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper">
      <label>{label}</label>
      <div className="custom-select">
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
      </div>
    </div>
  );
}

export default function DeviceForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData ? initialData.name : "",
    type: initialData ? initialData.type : "Electrodoméstico",
    location: initialData ? initialData.location : "",
    status: initialData ? initialData.status : "online",
    user: initialData ? initialData.user : "",
    consumption: initialData ? initialData.consumption : "0 kWh",
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

      case "location":
        if (!value.trim()) return "La ubicación es obligatoria.";
        return "";

      case "user":
        if (!value.trim()) return "Debe asignar un usuario.";
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
      location: true,
      user: true,
    });

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <form className="device-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">
          Nombre del Dispositivo <span className="required">*</span>
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
          placeholder="Ej: Aire Acondicionado Sala"
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

      <div className="form-row">
        <CustomSelect
          label="Tipo de Dispositivo"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={["Electrodoméstico", "HVAC", "Iluminación", "Otro"]}
        />

        <CustomSelect
          label="Estado"
          name="status"
          value={formData.status === "online" ? "En línea" : "Desconectado"}
          onChange={(e) => {
            const status = e.target.value === "En línea" ? "online" : "offline";
            handleChange({ target: { name: "status", value: status } });
          }}
          options={["En línea", "Desconectado"]}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">
          Ubicación <span className="required">*</span>
        </label>
        <motion.input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.location && touched.location ? "error" : ""}
          whileFocus="focus"
          variants={inputVariants}
          placeholder="Ej: Sala de estar"
        />
        {errors.location && touched.location && (
          <motion.span
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.location}
          </motion.span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="user">
          Usuario Asignado <span className="required">*</span>
        </label>
        <motion.input
          type="text"
          id="user"
          name="user"
          value={formData.user}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.user && touched.user ? "error" : ""}
          whileFocus="focus"
          variants={inputVariants}
          placeholder="Ej: Juan Pérez"
        />
        {errors.user && touched.user && (
          <motion.span
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.user}
          </motion.span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="consumption">Consumo Estimado</label>
        <motion.input
          type="text"
          id="consumption"
          name="consumption"
          value={formData.consumption}
          onChange={handleChange}
          whileFocus="focus"
          variants={inputVariants}
          placeholder="Ej: 2.5 kWh"
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
          {initialData ? "Actualizar" : "Crear Dispositivo"}
        </motion.button>
      </div>
    </form>
  );
}
