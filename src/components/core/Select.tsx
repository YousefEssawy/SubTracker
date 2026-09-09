import type { SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = ({ label, children, className = "", id, ...rest }: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <select id={id} className={`select-field ${className}`.trim()} {...rest}>
        {children}
      </select>
    </div>
  );
};

export default Select;
