import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { booksApi } from "../../services/api/booksApi";
import { categoriesApi } from "../../services/api/categoriesApi";
import { getFieldErrors, getGeneralError } from "../../utils/errorHelpers";
import { resolveCoverUrl } from "../../utils/imageHelpers";

export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);

  useEffect(() => {
    if (isEdit) {
      booksApi.get(id).then((res) => {
        reset(res.data);
        setExistingCoverUrl(res.data.cover_url);
      });
    }
    categoriesApi.list().then((res) => setCategories(res.data));
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setError("");
    setFieldErrors({});
    if (!Number.isInteger(data.quantity) || data.quantity < 1) {
      setFieldErrors({ quantity: "Quantity must be at least 1." });
      setError("Please enter a valid quantity before saving.");
      return;
    }
    const payload = {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      category_id: data.category_id ? data.category_id : null,
      quantity: data.quantity,
      description: data.description || null,
      cover_url: data.cover_url || null,
    };
    try {
      let bookId = id;
      if (isEdit) {
        await booksApi.update(id, payload);
      } else {
        const res = await booksApi.create(payload);
        bookId = res.data.id;
      }

      if (coverFile) {
        await booksApi.uploadCover(bookId, coverFile);
      }

      navigate("/librarian/books");
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getGeneralError(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {isEdit ? "Edit Book Reference" : "Add Book Reference"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Specify detailed catalog metrics for the library textbook</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/librarian/books")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm font-medium text-red-700">
              <svg className="h-5 w-5 shrink-0 text-crimson mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Book Title
              </label>
              <input
                required
                placeholder="e.g. Introduction to Algorithms"
                {...register("title", { required: true })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Author
              </label>
              <input
                required
                placeholder="e.g. Thomas H. Cormen"
                {...register("author", { required: true })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
              {fieldErrors.author && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.author}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                ISBN Code
              </label>
              <input
                placeholder="e.g. 9780262033848"
                {...register("isbn")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
              {fieldErrors.isbn && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.isbn}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <select
                {...register("category_id")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none appearance-none"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-3.5 bottom-3.5 pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Available Quantity (Stock)
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 5"
                {...register("quantity", { required: true, valueAsNumber: true, min: 1 })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
              {fieldErrors.quantity && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.quantity}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Book Summary / Description
              </label>
              <textarea
                placeholder="Provide a brief course reference summary or syllabus alignment..."
                {...register("description")}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
            </div>

            <div className="sm:col-span-2 border-t border-slate-50 pt-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Cover Image Upload
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {existingCoverUrl && !coverFile && (
                  <img
                    src={resolveCoverUrl(existingCoverUrl)}
                    alt="Current cover"
                    className="h-28 w-20 rounded-xl object-cover shadow-sm border border-slate-100 shrink-0"
                  />
                )}
                
                <div className="relative overflow-hidden w-full">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setCoverFile(e.target.files[0] || null)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-soft file:text-indigo hover:file:bg-indigo hover:file:text-white file:transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={() => navigate("/librarian/books")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                isEdit ? "Save Changes" : "Create Book"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

