import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";
import axios from "axios";
import "../../../styles/components/admin/deviceForm.scss";

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

function UserSelect({ label, value, onChange, options, name, error, touched, onBlur }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (user) => {
    onChange({ target: { name, value: user.id } });
    setIsOpen(false);
  };

  const selectedUser = options.find(u => u.id === value);
  const displayValue = selectedUser ? selectedUser.name : "Seleccionar usuario";

  return (
    <div className="custom-select-wrapper">
      <label>{label}</label>
      <div className={`custom-select ${error && touched ? "error" : ""}`}>
        <motion.div
          className="select-header"
          onClick={handleToggle}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span>{displayValue}</span>
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
            {options.map((user, index) => (
              <motion.div
                key={user.id}
                className={`select-option ${
                  value === user.id ? "selected" : ""
                }`}
                onClick={() => handleSelect(user)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
              >
                <div>
                  <div className="user-name">{user.name || user.email}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                </div>
                {value === user.id && (
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
      {error && touched && (
        <motion.span
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.span>
      )}
    </div>
  );
}

export default function DeviceForm({ onSubmit, onCancel, initialData = null, hideUserSelect = false }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({
    name: initialData ? initialData.name : "",
    type: initialData ? initialData.type : "Electrodoméstico",
    location: initialData ? initialData.location : "",
    status: initialData ? initialData.status : "online",
    userId: initialData?.userId || initialData?.user?.id || "",
    consumption: initialData ? initialData.consumption : "0 kWh",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!hideUserSelect) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get("/api/users");
          setUsers(response.data.filter(u => u.role === "user"));
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    } else {
      setLoadingUsers(false);
    }
  }, [hideUserSelect]);

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

      case "userId":
        if (!hideUserSelect && !value) return "Debe asignar un usuario.";
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
    const touchedFields = {
      name: true,
      location: true,
    };
    if (!hideUserSelect) {
      touchedFields.userId = true;
    }
    setTouched(touchedFields);

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

      {!hideUserSelect && (
        <div className="form-group">
          <UserSelect
            label="Usuario Asignado"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            onBlur={handleBlur}
            options={users}
            error={errors.userId}
            touched={touched.userId}
            loading={loadingUsers}
          />
          {loadingUsers && (
            <span style={{ fontSize: "0.85rem", color: "#666" }}>
              Cargando usuarios...
            </span>
          )}
        </div>
      )}

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
