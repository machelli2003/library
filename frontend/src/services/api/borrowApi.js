import api from "./axiosInstance";

export const borrowApi = {
  request: (bookId) => api.post("/borrow", { book_id: bookId }),
  approve: (id) => api.patch(`/borrow/${id}/approve`),
  reject: (id) => api.patch(`/borrow/${id}/reject`),
  return: (id) => api.patch(`/borrow/${id}/return`),
  renew: (id) => api.patch(`/borrow/${id}/renew`),
  myHistory: () => api.get("/borrow/history"),
  pendingRequests: () => api.get("/borrow/pending"),
  activeLoans: () => api.get("/borrow/active"),
};
