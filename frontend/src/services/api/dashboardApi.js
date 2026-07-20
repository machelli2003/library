import api from "./axiosInstance";

export const dashboardApi = {
  student: () => api.get("/dashboard/student"),
  librarian: () => api.get("/dashboard/librarian"),
  admin: () => api.get("/dashboard/admin"),
  reports: () => api.get("/dashboard/admin/reports"),
  activities: () => api.get("/dashboard/activities"),
};
