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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Manage Books</h1>
        <Link
          to="/librarian/books/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          + Add Book
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : books.length === 0 ? (
        <EmptyState title="No books in the catalogue yet" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Author</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{b.title}</td>
                  <td className="px-5 py-3 text-slate-500">{b.author}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {b.available_copies} / {b.quantity}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{b.category || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/librarian/books/${b.id}/edit`}
                      className="mr-3 text-slate-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id)}
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
