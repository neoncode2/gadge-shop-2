import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "",
  headers: {
    Accept: "application/json",
  },
});

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default api;
