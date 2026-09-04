interface FormFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}

export function FormField({ label, value, onChange, placeholder, textarea }: FormFieldProps) {
  const commonProps = {
    value: value ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder: placeholder ?? label,
    className: "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none",
  };

  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {textarea ? <textarea rows={3} {...commonProps} /> : <input type="text" {...commonProps} />}
    </label>
  );
}
