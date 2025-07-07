import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { LoginContext } from "./Context.js";
import axios from "axios";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Awal from "./Awal.jsx";
import "./axiosConfig";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";
  const navigate = useNavigate();

  function handleRegister() {
    setIsLogin(false);
  }

  function handleLogin() {
    setIsLogin(true);
  }

  const fetchCurrentUser = async () => {
    const storedUser = localStorage.getItem("user");
    let userId;

    if (currentUser?.id) {
      userId = currentUser.id;
    } else if (storedUser) {
      try {
        userId = JSON.parse(storedUser).id;
      } catch (e) {
        console.error("Failed to parse user from localStorage for userId", e);
        handleLogout();
        return;
      }
    }

    if (!userId) {
      console.warn("DEBUG: userId tidak ditemukan di fetchCurrentUser.");
      setIsAuthenticated(false);
      setCurrentUser(null);
      return;
    }

    try {
      console.log(
        "DEBUG: Memanggil API untuk fetchCurrentUser dengan userId:",
        userId
      );
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("DEBUG: Token tidak ditemukan saat fetchCurrentUser.");
        handleLogout();
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedUser = response.data.user;
      setCurrentUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("currentUser berhasil di-update di App.jsx:", updatedUser);
    } catch (error) {
      console.error(
        "DEBUG: Gagal mengambil data user terbaru di fetchCurrentUser:",
        error
      );
      if (
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status === 404
      ) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    const loadAndFetchUser = async () => {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");

      if (userJson && token) {
        try {
          const parsedUser = JSON.parse(userJson);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          await fetchCurrentUser();
        } catch (error) {
          console.error(
            "DEBUG: Failed to parse user or token invalid in localStorage in useEffect:",
            error
          );
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    loadAndFetchUser();
  }, []);

  const handleAddUser = useCallback(
    async (email, password, username) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/register`, {
          username,
          email,
          password,
        });

        console.log("Respons dari server:", response.data);
        alert("User berhasil ditambahkan!");
        setIsLogin(true);
      } catch (error) {
        console.error("Error menambahkan user:", error);

        const errorMessage =
          error.response?.data?.error ||
          "Gagal menambah user karena kesalahan tidak diketahui.";
        alert(errorMessage);
      }
    },
    [API_BASE_URL]
  );

  const handleCheckUser = useCallback(
    async (email, password) => {
      if (!email || !password) {
        alert("Email dan password harus diisi.");
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/login`, {
          email,
          password,
        });
        console.log("Respons dari server:", response.data);
        const { user, token } = response.data;
        if (user && token) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token);
          setIsAuthenticated(true);
          setCurrentUser(user);
          await fetchCurrentUser();
          navigate("/dashboard");
        } else {
          setError(
            "Respons login tidak valid: user atau token tidak ditemukan."
          ); // Tambahkan state error jika belum ada
        }
      } catch (error) {
        console.error("Error masuk user:", error);
      }
    },
    [API_BASE_URL, fetchCurrentUser, navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    alert("Anda telah logout.");
    navigate("/");
  }, [navigate]);

  const valueLoginContext = {
    handleRegister,
    handleLogin,
    handleAddUser,
    handleCheckUser,
    isLogin,
    isAuthenticated,
    currentUser,
    handleLogout,
    onProfileUpdateSuccess: fetchCurrentUser,
  };

  return (
    <>
      <LoginContext.Provider value={valueLoginContext}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Awal />
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </LoginContext.Provider>
    </>
  );
}
