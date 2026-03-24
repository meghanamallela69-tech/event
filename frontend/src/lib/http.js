export const API_BASE = "http://localhost:5000/api/v1";
export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});
