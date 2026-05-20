import { apiRequest, setToken } from "./apiClient";

const CURRENT_USER_KEY = "currentUser";

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch (_) {
    return null;
  }
}

export async function registerUser(payload) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      fullName: payload.name,
      role: payload.role || "learner",
      phoneNumber: payload.phone || "",
      countryCode: payload.country || ""
    })
  });
  setToken(data.token);
  setCurrentUser({
    id: data.user.id,
    name: data.user.fullName || "",
    email: data.user.email,
    role: data.user.role
  });
  return data;
}

export async function loginUser(payload) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password
    })
  });
  setToken(data.token);
  setCurrentUser({
    id: data.user.id,
    name: data.user.fullName || "",
    email: data.user.email,
    role: data.user.role
  });
  return data;
}

export async function hydrateCurrentUser() {
  const data = await apiRequest("/auth/me");
  setCurrentUser({
    id: data.user.id,
    name: data.user.fullName || "",
    email: data.user.email,
    role: data.user.role
  });
  return data.user;
}

export async function updateProfile(payload) {
  const data = await apiRequest("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  // Update local storage name if it changed
  const current = getCurrentUser();
  if (current && data.user.fullName) {
    setCurrentUser({
      ...current,
      name: data.user.fullName
    });
  }
  return data.user;
}

export function logoutUser() {
  setToken("");
  setCurrentUser(null);
}
