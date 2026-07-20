import api from "./axiosInstance";

export const reviewsApi = {
  list: (bookId) => api.get(`/books/${bookId}/reviews`),
  checkEligibility: (bookId) => api.get(`/books/${bookId}/review-eligibility`),
  create: (bookId, rating, comment) => api.post(`/books/${bookId}/reviews`, { rating, comment }),
};
