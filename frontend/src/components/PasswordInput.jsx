import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function PasswordInput({
  name = "password",
  value,
  onChange,
  placeholder = "Enter your password",
  minLength,
  autoComplete,
  required = true,
  id,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;
