import { apiRequest } from "./apiClient";

export async function getAdminStats() {
  const data = await apiRequest("/admin/stats");
  return data.data;
}

export async function getRecentActivity() {
  const data = await apiRequest("/admin/recent-activity");
  return data.data || [];
}

export async function getAdminUsers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role && filters.role !== "all") params.set("role", filters.role);
  const qs = params.toString();
  const data = await apiRequest(`/admin/users${qs ? `?${qs}` : ""}`);
  return data.data || [];
}

export async function getAdminUser(id) {
  const data = await apiRequest(`/admin/users/${id}`);
  return data.data;
}

export async function createAdminUser(payload) {
  const data = await apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function updateAdminUser(id, payload) {
  const data = await apiRequest(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteAdminUser(id) {
  const data = await apiRequest(`/admin/users/${id}`, {
    method: "DELETE"
  });
  return data.data;
}

export async function getSystemReports() {
  const data = await apiRequest("/admin/reports");
  return data.data;
}
