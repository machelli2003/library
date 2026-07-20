import api from "./axiosInstance";

export const finesApi = {
  myFines: () => api.get("/fines/mine"),
  all: () => api.get("/fines"),
  markPaid: (id) => api.patch(`/fines/${id}/pay`),
};
