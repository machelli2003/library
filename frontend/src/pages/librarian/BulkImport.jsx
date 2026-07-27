import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { booksApi } from "../../services/api/booksApi";

export default function BulkImport() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("json"); // "json" or "csv"
  const [jsonData, setJsonData] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const sampleJson = `[
  {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "isbn": "9780743273565", "category": "Literature", "quantity": 3},
  {"title": "To Kill a Mockingbird", "author": "Harper Lee", "isbn": "9780061120084", "category": "Literature", "quantity": 2}
]`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let res;
      if (mode === "json") {
        const data = JSON.parse(jsonData);
        if (!Array.isArray(data)) throw new Error("JSON must be an array of books");
        res = await booksApi.bulkImport(data);
      } else {
        if (!csvFile) throw new Error("Please select a CSV file");
        res = await booksApi.bulkImportFile(csvFile);
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Bulk Import Books</h1>
          <p className="text-sm text-slate-400 mt-1">Import multiple books at once using JSON or CSV format</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/librarian/books")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          Back to Books
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit">
        <button
          onClick={() => setMode("json")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            mode === "json"
              ? "bg-white text-indigo shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          JSON Import
        </button>
        <button
          onClick={() => setMode("csv")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            mode === "csv"
              ? "bg-white text-indigo shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          CSV Upload
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm font-medium text-red-700">
              <svg className="h-5 w-5 shrink-0 text-crimson mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className={`rounded-xl border p-4 text-sm font-medium ${
              result.imported > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}>
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {result.imported > 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  )}
                </svg>
                <div>
                  <p className="font-semibold">
                    Successfully imported {result.imported} of {result.total} books.
                  </p>
                  {result.errors?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs">
                      {result.errors.map((e, i) => (
                        <li key={i}>Row {e.row}: {e.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === "json" ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                JSON Data
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={10}
                placeholder={sampleJson}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-mono text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
              <p className="mt-2 text-xs text-slate-400">
                Each book should have: title, author, isbn (optional), category (optional), quantity (optional, default 1)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                CSV File
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo/30 transition">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-soft file:text-indigo hover:file:bg-indigo hover:file:text-white file:transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                CSV must have columns: title, author, isbn, category, quantity, description
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={() => navigate("/librarian/books")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Importing...</span>
                </>
              ) : (
                "Import Books"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

