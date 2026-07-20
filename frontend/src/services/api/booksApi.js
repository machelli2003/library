import api from "./axiosInstance";

export const booksApi = {
  list: (params) => api.get("/books", { params }),
  get: (id) => api.get(`/books/${id}`),
  create: (payload) => api.post("/books", payload),
  update: (id, payload) => api.put(`/books/${id}`, payload),
  remove: (id) => api.delete(`/books/${id}`),
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/books/${id}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
