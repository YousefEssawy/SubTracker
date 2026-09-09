import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = "", id, ...rest }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <input id={id} className={`input-field ${className}`.trim()} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
