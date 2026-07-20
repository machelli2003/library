import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center">
      <h1 className="text-3xl font-bold text-slate-800">403</h1>
      <p className="mt-2 text-slate-500">
        You don't have permission to view this page.
      </p>
      <Link to="/" className="mt-6 text-slate-800 underline">
        Back to home
      </Link>
    </div>
  );
}
