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
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Catalogue</h1>
          <p className="text-sm text-slate-400 mt-1">Explore our collection of library books, resources, and materials</p>
        </div>
        
        {/* Controls block */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => {
                setPage(1);
                setCategoryId(e.target.value);
              }}
              className="w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by title or author..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Searching catalogue..." />
      ) : books.length === 0 ? (
        <EmptyState title="No books found" subtitle="Try adjusting your search criteria or category filter." />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} basePath="/student" />
            ))}
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5 pt-6 border-t border-slate-100">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                    p === page
                      ? "bg-indigo text-white shadow-md shadow-indigo/20 scale-105"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

