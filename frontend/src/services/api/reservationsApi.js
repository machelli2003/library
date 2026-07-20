import api from "./axiosInstance";

export const reservationsApi = {
  my: () => api.get("/reservations/my"),
  create: (bookId) => api.post("/reservations", { book_id: bookId }),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),
};
