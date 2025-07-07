import axios from "axios";

// Ini akan menambahkan interceptor ke instance axios default
axios.interceptors.request.use(
  (config) => {
    // Dapatkan token dari localStorage
    const token = localStorage.getItem("token");

    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Tangani kesalahan request
    return Promise.reject(error);
  }
);
