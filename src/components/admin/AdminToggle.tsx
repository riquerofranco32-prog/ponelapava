"use client";

interface AdminToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function AdminToggle({ checked, onChange, label }: AdminToggleProps) {
  return (
    <label className="admin-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="admin-toggle-track" aria-hidden="true">
        <span className="admin-toggle-thumb" />
      </span>
      {label}
    </label>
  );
}
