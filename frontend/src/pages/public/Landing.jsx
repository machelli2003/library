import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-800">
        University Library System
      </h1>
      <p className="mt-3 max-w-lg text-slate-500">
        Search the catalogue, borrow books, and track fines — all in one
        place.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/login"
          className="rounded-lg bg-slate-900 px-6 py-2 text-white hover:bg-slate-700"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="rounded-lg border border-slate-300 px-6 py-2 text-slate-700 hover:bg-slate-100"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
