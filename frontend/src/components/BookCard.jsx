import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

export default function BookCard({ book, basePath }) {
  const isAvailable = book.is_available && (book.available_copies === undefined || book.available_copies > 0);

  return (
    <Link
      to={`${basePath}/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-700/20"
    >
      {/* Book Cover Container */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 text-blue-800/40 transition-all duration-300 group-hover:from-blue-50 group-hover:to-slate-100">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700/10 text-brand-700 transition-transform duration-300 group-hover:scale-110">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* Absolute Availability Tag */}
        <div className="absolute right-2.5 top-2.5">
          <Badge variant={isAvailable ? "default" : "destructive"} dot>
            {isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      {/* Book Details Container */}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          {book.category || "General Collection"}
        </span>
        <h3 className="line-clamp-2 font-display text-base font-bold text-ink transition-colors duration-200 group-hover:text-brand-700">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 font-medium truncate">{book.author}</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-400 font-medium">Copies</span>
          <span className={cn(
            "font-mono font-bold flex items-center gap-1",
            isAvailable ? "text-brand-700" : "text-red-500"
          )}>
            {isAvailable ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-700" />
                <span>{book.available_copies ?? 1} / {book.quantity ?? 1}</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                <span>0 available</span>
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}