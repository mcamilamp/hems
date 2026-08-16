"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaIdCard, FaBolt } from "react-icons/fa";
import TariffSummary from "@/components/user/settings/TariffSummary";

// Comercializador y mercado no se editan: son el contexto del prototipo
// (Santa Marta, atendida por Air-e), iguales para todos los clientes. Se
// muestran como dato para poder justificar de que cuadro sale la tarifa.
const SELECTS = [
  { name: "category", label: "Categoría de usuario" },
  { name: "voltageLevel", label: "Nivel de tensión" },
];

export default function CompanyTab({ company, tariff, options, onSave }) {
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...company });

  // Misma razon que en ProfileTab: `form` copia la prop y useState solo mira
  // su valor inicial, asi que hay que resincronizar cuando llega el dato.
  useEffect(() => {
    if (!edit) setForm({ ...company });
  }, [company, edit]);

  // Tocar cualquier campo entra en edicion. El boton queda como atajo, no como
  // peaje previo.
  function startEdit() {
    if (!edit) setEdit(true);
  }

  function handleChange(e) {
    startEdit();
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok !== false) setEdit(false);
  }

  return (
    <motion.div className="profile-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Perfil de la empresa</h3>

          {/* readOnly y no disabled: un campo deshabilitado no emite eventos,
              asi que tocarlo nunca podria abrir la edicion. */}
          <div className="form-group">
            <label htmlFor="name"><FaBuilding className="input-icon" />Nombre</label>
            <input id="name" name="name" value={form.name || ""} onChange={handleChange}
              readOnly={!edit} onFocus={startEdit} className={edit ? "" : "is-readonly"} />
          </div>

          <div className="form-group">
            <label htmlFor="nit"><FaIdCard className="input-icon" />NIT</label>
            <input id="nit" name="nit" value={form.nit || ""} onChange={handleChange}
              readOnly={!edit} onFocus={startEdit} className={edit ? "" : "is-readonly"} />
          </div>
        </div>

        <div className="form-section">
          <h3>Perfil tarifario</h3>

          <p className="tariff-context">
            Comercializador <strong>{company.provider}</strong> · mercado{" "}
            <strong>{company.market}</strong>
          </p>

          {/* Selects y no texto libre: el match con el cuadro tarifario es por
              string exacto, y un typo dejaria la estimacion en cero. */}
          {SELECTS.map(({ name, label }) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}><FaBolt className="input-icon" />{label}</label>
              {/* Un <select> no admite readOnly: queda habilitado y es el
                  mousedown el que abre la edicion, en el mismo clic con el que
                  se despliega. */}
              <select id={name} name={name} value={form[name] || ""} onChange={handleChange}
                onMouseDown={startEdit} className={edit ? "" : "is-readonly"}>
                {(options?.[name] || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="form-group checkbox-group">
            <label htmlFor="exemptContribution">
              <input
                type="checkbox"
                id="exemptContribution"
                name="exemptContribution"
                checked={Boolean(form.exemptContribution)}
                onChange={handleChange}
              />
              Exenta de contribución de solidaridad
            </label>
          </div>
        </div>

        <TariffSummary tariff={tariff} />

        <div className="form-actions">
          {edit ? (
            <>
              <button type="button" className="btn-cancel" onClick={() => setEdit(false)} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </>
          ) : (
            <button type="button" className="btn-edit" onClick={() => setEdit(true)}>
              Editar Empresa
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
