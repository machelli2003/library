import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFieldErrors, getGeneralError } from "../../utils/errorHelpers";

const validatePassword = (value) => {
  if (!value || value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Password must include letters and numbers.";
  }
  return true;
};

export default function Register() {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (data) => {
    setError("");
    setFieldErrors({});
    try {
      await register({ ...data, role: "student" });
      navigate("/login");
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getGeneralError(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm"
      >
        <h2 className="mb-6 text-2xl font-semibold text-slate-800">
          Create your account
        </h2>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="mb-1 block text-sm text-slate-600">Full name</label>
        <input
          {...registerField("name", { required: "Name is required." })}
          className="mb-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {(errors.name?.message || fieldErrors.name) && (
          <p className="mb-3 text-xs text-red-500">{errors.name?.message || fieldErrors.name}</p>
        )}

        <label className="mb-1 block text-sm text-slate-600">Email</label>
        <input
          type="email"
          {...registerField("email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email.",
            },
          })}
          className="mb-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {(errors.email?.message || fieldErrors.email) && (
          <p className="mb-3 text-xs text-red-500">{errors.email?.message || fieldErrors.email}</p>
        )}

        <label className="mb-1 block text-sm text-slate-600">Password</label>
        <input
          type="password"
          {...registerField("password", {
            required: "Password is required.",
            validate: validatePassword,
          })}
          className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {(errors.password?.message || fieldErrors.password) && (
          <p className="mb-6 text-xs text-red-500">{errors.password?.message || fieldErrors.password}</p>
        )}

        {/* Role is not selectable in public registration; backend enforces student role. */}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2 text-white hover:bg-slate-700"
        >
          Create account
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="text-slate-800 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
