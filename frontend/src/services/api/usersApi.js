import api from "./axiosInstance";

export const usersApi = {
  list: (params) => api.get("/users", { params }),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  createStaff: (payload) => api.post("/auth/create-staff", payload),
};
