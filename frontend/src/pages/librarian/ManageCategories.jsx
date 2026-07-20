import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { categoriesApi } from "../../services/api/categoriesApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset } = useForm();

  const load = () => {
    setLoading(true);
    categoriesApi
      .list()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (data) => {
    setError("");
    try {
      await categoriesApi.create(data);
      reset();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add category");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Books in it will become uncategorized.")) return;
    await categoriesApi.remove(id);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">Manage Categories</h1>
        <p className="text-sm text-slate-400 mt-1">Classify textbook inventory by creating or deleting categories</p>
      </div>

      {/* Add Category Form Banner */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/40">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              required
              {...register("name", { required: true })}
              placeholder="e.g. Computer Science, Mathematics..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15 shrink-0"
          >
            Create Category
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm font-medium text-red-700">
          <svg className="h-5 w-5 shrink-0 text-crimson mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading classification list..." />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" subtitle="Enter a name in the field above to register your first textbook category." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-crimson transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

