import { useEffect, useState } from "react";
import { booksApi } from "../../services/api/booksApi";
import { categoriesApi } from "../../services/api/categoriesApi";
import BookCard from "../../components/BookCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function Catalogue() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    booksApi
      .list({ search, category_id: categoryId || undefined, page, per_page: 12 })
      .then((res) => {
        setBooks(res.data.books);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, categoryId, page]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Catalogue</h1>
        <div className="flex gap-3">
          <select
            value={categoryId}
            onChange={(e) => {
              setPage(1);
              setCategoryId(e.target.value);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by title or author..."
            className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : books.length === 0 ? (
        <EmptyState title="No books found" subtitle="Try a different search term or category" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} basePath="/student" />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-sm ${
                    p === page
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
