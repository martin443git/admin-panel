import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

function toLocalInput(v) {
  if (!v) return "";
  const d = new Date(v);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SelectField({ field, value, onChange }) {
  const { data = [] } = useQuery({
    queryKey: [field.optionsEndpoint, "options"],
    queryFn: () =>
      api
        .get(field.optionsEndpoint, { params: { page_size: 500 } })
        .then((r) => r.data.results),
    enabled: !!field.optionsEndpoint,
  });
  const options =
    field.options || data.map((o) => ({ value: o.id, label: field.optionLabel(o) }));

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={field.required}>
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function FormModal({ title, fields, initial, onClose, onSave }) {
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach((f) => {
      const raw = initial[f.name];
      if (f.type === "checkbox") v[f.name] = raw ?? f.default ?? false;
      else if (f.type === "datetime") v[f.name] = toLocalInput(raw);
      else v[f.name] = raw ?? "";
    });
    return v;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    const payload = {};
    fields.forEach((f) => {
      let v = values[f.name];
      if (f.type === "number") v = v === "" ? null : Number(v);
      else if (f.type === "select" && f.optionsEndpoint) v = v === "" ? null : Number(v);
      else if ((f.type === "date" || f.type === "datetime") && v === "") v = null;
      payload[f.name] = v;
    });
    try {
      await onSave(payload);
    } catch (err) {
      const d = err.response?.data;
      setErrors(d && typeof d === "object" ? d : { detail: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  const topError = errors.detail || errors.non_field_errors?.join(" ");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{title}</h3>
        {topError && <div className="error">{topError}</div>}

        {fields.map((f) => (
          <div className="field" key={f.name}>
            {f.type === "checkbox" ? (
              <label className="check">
                <input
                  type="checkbox"
                  checked={!!values[f.name]}
                  onChange={(e) => set(f.name, e.target.checked)}
                />
                {f.label}
              </label>
            ) : (
              <>
                <label>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[f.name]}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                ) : f.type === "select" ? (
                  <SelectField field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
                ) : (
                  <input
                    type={f.type === "datetime" ? "datetime-local" : f.type || "text"}
                    step={f.step}
                    value={values[f.name]}
                    required={f.required}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
              </>
            )}
            {errors[f.name] && (
              <div className="field-error">{[].concat(errors[f.name]).join(" ")}</div>
            )}
          </div>
        ))}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}