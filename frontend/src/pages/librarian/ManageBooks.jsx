import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { booksApi } from "../../services/api/booksApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    booksApi
      .list({ per_page: 100 })
      .then((res) => setBooks(res.data.books))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    await booksApi.remove(id);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Manage Books</h1>
          <p className="text-sm text-slate-400 mt-1">Add, update, or remove textbook inventory from the system</p>
        </div>
        <Link
          to="/librarian/books/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add Textbook</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading book inventory..." />
      ) : books.length === 0 ? (
        <EmptyState title="No books in the catalogue yet" subtitle="Click the Add Textbook button to create your first entry." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Stock Available</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-5 font-semibold text-slate-800">{b.title}</td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{b.author}</td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-600 font-semibold">
                      {b.available_copies} / {b.quantity}
                    </td>
                    <td className="px-6 py-5 font-semibold text-xs text-slate-400 uppercase tracking-wider">{b.category || "General"}</td>
                    <td className="px-6 py-5 text-right space-x-3">
                      <Link
                        to={`/librarian/books/${b.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
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

