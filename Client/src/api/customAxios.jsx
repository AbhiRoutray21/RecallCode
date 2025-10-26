import axios from "axios";

// const BASE_URL = "http://10.145.133.224:7000";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const axiosBase = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export const axiosPrivate = axios.create({
  baseURL:BASE_URL,
  headers: {'Content-Type': 'application/json'},
  withCredentials: true
});
