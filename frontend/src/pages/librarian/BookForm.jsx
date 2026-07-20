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
    const payload = {
      ...data,
      quantity: Number(data.quantity),
      category_id: data.category_id ? Number(data.category_id) : null,
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
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">
        {isEdit ? "Edit Book" : "Add Book"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-600">Title</label>
          <input
            {...register("title", { required: true })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">Author</label>
          <input
            {...register("author", { required: true })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {fieldErrors.author && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.author}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">ISBN</label>
          <input
            {...register("isbn")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {fieldErrors.isbn && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.isbn}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">Category</label>
          <select
            {...register("category_id")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">Quantity</label>
          <input
            type="number"
            min="1"
            {...register("quantity", { required: true, min: 1 })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {fieldErrors.quantity && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.quantity}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">Cover Image</label>
          {existingCoverUrl && !coverFile && (
            <img
              src={resolveCoverUrl(existingCoverUrl)}
              alt="Current cover"
              className="mb-2 h-24 w-24 rounded-lg object-cover"
            />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setCoverFile(e.target.files[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isEdit ? "Save Changes" : "Add Book"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/librarian/books")}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
