import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-6xl font-bold text-slate-800">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-700">Page Not Found</h2>
        <p className="mt-2 text-slate-500">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
