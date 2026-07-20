import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setError("");
    try {
      const user = await login(data.email, data.password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm"
      >
        <h2 className="mb-6 text-2xl font-semibold text-slate-800">
          Sign in
        </h2>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="mb-1 block text-sm text-slate-600">Email</label>
        <input
          type="email"
          {...register("email", { required: true })}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        <label className="mb-1 block text-sm text-slate-600">Password</label>
        <input
          type="password"
          {...register("password", { required: true })}
          className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2 text-white hover:bg-slate-700"
        >
          Sign in
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/register" className="text-slate-800 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
