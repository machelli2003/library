import api from "./axiosInstance";

export const dashboardApi = {
  student: () => api.get("/dashboard/student"),
  librarian: () => api.get("/dashboard/librarian"),
  admin: () => api.get("/dashboard/admin"),
  reports: () => api.get("/dashboard/admin/reports"),
  activities: () => api.get("/dashboard/activities"),
  recentUsers: () => api.get("/dashboard/admin/recent-users"),
  exportFines: () => api.get("/dashboard/admin/export/fines", { responseType: "blob" }),
  exportBorrows: () => api.get("/dashboard/admin/export/borrows", { responseType: "blob" }),
};

