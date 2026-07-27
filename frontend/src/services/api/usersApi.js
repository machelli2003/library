import api from "./axiosInstance";

export const usersApi = {
  list: (params) => api.get("/users", { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  createStaff: (payload) => api.post("/auth/create-staff", payload),
};

