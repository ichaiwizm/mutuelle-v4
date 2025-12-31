/**
 * Select Field Component
 * Styled select input for forms
 */
interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  disabled: boolean;
  placeholder: string;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({
  label,
  value,
  disabled,
  placeholder,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
