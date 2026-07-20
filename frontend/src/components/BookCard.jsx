import { Link } from "react-router-dom";
import { resolveCoverUrl } from "../utils/imageHelpers";

export default function BookCard({ book, basePath }) {
  const coverSrc = resolveCoverUrl(book.cover_url);

  return (
    <Link
      to={`${basePath}/books/${book.id}`}
      className="flex flex-col rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={book.title}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <span className="text-xs">No cover</span>
        )}
      </div>
      <h3 className="line-clamp-2 font-medium text-slate-800">{book.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{book.author}</p>
      
      {book.review_count > 0 && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500 font-medium">
          <span>{"★".repeat(Math.round(book.average_rating)) + "☆".repeat(5 - Math.round(book.average_rating))}</span>
          <span className="text-slate-400 font-normal">({book.review_count})</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">{book.category || "Uncategorized"}</span>
        <span
          className={book.is_available ? "text-emerald-600" : "text-red-500"}
        >
          {book.is_available
            ? `${book.available_copies} available`
            : "Unavailable"}
        </span>
      </div>
    </Link>
  );
}
