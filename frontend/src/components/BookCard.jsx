import { Link } from "react-router-dom";

export default function BookCard({ book, basePath }) {
  return (
    <Link
      to={`${basePath}/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-indigo/20 hover:shadow-md hover:shadow-indigo/5"
    >
      {/* Book Cover Container */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-soft to-indigo/5 text-indigo/35 transition-all duration-300 group-hover:from-indigo-soft group-hover:to-indigo/10">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-3xl font-semibold opacity-70 transition-transform duration-300 group-hover:scale-110">
              {book.title?.[0] || "?"}
            </span>
            <svg className="h-5 w-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}

        {/* Absolute Availability Tag */}
        <div className="absolute right-2 top-2">
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider shadow-sm ${
            book.is_available
              ? "border-emerald-100 bg-emerald-50 text-emerald"
              : "border-red-100 bg-red-50 text-crimson"
          }`}>
            {book.is_available ? "In Stock" : "On Loan"}
          </span>
        </div>
      </div>

      {/* Book Details Container */}
      <div className="flex flex-1 flex-col p-3">
        <span className="mb-1 text-[9px] font-mono uppercase tracking-wider text-slate-400">
          {book.category || "General"}
        </span>
        <h3 className="line-clamp-2 font-display text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-indigo">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{book.author}</p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 text-[11px]">
          <span className="text-slate-400">Copies available</span>
          <span className={`font-mono font-semibold ${book.is_available ? "text-emerald" : "text-crimson"}`}>
            {book.is_available ? `${book.available_copies} / ${book.quantity}` : "None available"}
          </span>
        </div>
      </div>
    </Link>
  );
}