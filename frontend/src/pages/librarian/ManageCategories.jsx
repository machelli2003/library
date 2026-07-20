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
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Manage Categories</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 flex gap-3 rounded-xl bg-white p-4 shadow-sm"
      >
        <input
          {...register("name", { required: true })}
          placeholder="New category name..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{c.name}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
