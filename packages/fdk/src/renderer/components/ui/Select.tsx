import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  options,
  placeholder = 'Select...',
  id,
  className = '',
  ...props
}: SelectProps): ReactNode {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  // Group options if any have group property
  const grouped = options.reduce<Record<string, SelectOption[]>>((acc, opt) => {
    const group = opt.group || '__ungrouped__';
    if (!acc[group]) acc[group] = [];
    acc[group].push(opt);
    return acc;
  }, {});

  const hasGroups = Object.keys(grouped).some(k => k !== '__ungrouped__');

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-400">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {hasGroups
          ? Object.entries(grouped).map(([group, opts]) =>
              group === '__ungrouped__' ? (
                opts.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <optgroup key={group} label={group}>
                  {opts.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              )
            )
          : options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
    </div>
  );
}
