import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children, onLogoutCallback }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const response = await axios.get("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        console.log("Profile response:", response.data); // Log để debug

        const userDataFromProfile = {
          email: response.data.email,
          firstName: response.data.fullName?.split(" ")[0] || (storedUser.firstName || ""),
          lastName: response.data.fullName?.split(" ").slice(1).join(" ") || (storedUser.lastName || ""),
          phone: response.data.phone || (storedUser.phone || "Chưa cập nhật"),
          address: response.data.address || (storedUser.address || "Vietnam"),
          role: response.data.role || (storedUser.role || ""), // Chỉ dùng storedUser.role nếu response thiếu role
        };

        setIsAuthenticated(true);
        setToken(storedToken);
        setUser(userDataFromProfile);
        localStorage.setItem("user", JSON.stringify(userDataFromProfile));
      } catch (err) {
        console.error("Token validation error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
          setToken("");
          toast.error("Token hết hạn, vui lòng đăng nhập lại.");
        } else {
          // Nếu lỗi khác, giữ user từ localStorage
          if (storedUser) {
            const userDataFromStorage = JSON.parse(storedUser);
            setIsAuthenticated(true);
            setToken(storedToken);
            setUser(userDataFromStorage);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setToken("");
          }
        }
      }
    } else {
      setIsAuthenticated(false);
      setToken("");
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = async (newToken, userData) => {
    try {
      console.log("Login data:", userData); // Log để debug
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setIsAuthenticated(true);
      setToken(newToken);
      setUser(userData);
      return userData.role;
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Lỗi khi đăng nhập!", { position: "top-right" });
      setIsAuthenticated(false);
      setToken("");
      setUser(null);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setToken("");
    setUser(null);
    if (onLogoutCallback) {
      onLogoutCallback();
    }
  };

  const switchRole = async (newRole) => {
    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để chuyển đổi vai trò!", { position: "top-right" });
      return;
    }

    if (user.role.toLowerCase() !== "admin" || newRole.toLowerCase() !== "admin") {
      toast.error("Bạn không có quyền chuyển đổi vai trò này!", { position: "top-right" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/switch-role",
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, role: response.data.role || newRole };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(`Đã xác nhận vai trò ${newRole}!`, { position: "top-right" });
    } catch (err) {
      console.error("Error switching role:", err.response?.data || err.message);
      toast.error("Lỗi khi xác nhận vai trò!", { position: "top-right" });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};