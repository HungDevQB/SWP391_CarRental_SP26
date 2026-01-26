// src/hooks/useAuthHandler.js
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthHandler = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const expiresAt = params.get("expiresAt");
        const role = params.get("role");
        const username = params.get("username");

        console.log('[useAuthHandler] URL params:', { token: token ? 'Có' : 'Không có', expiresAt, role, username });

        if (token && expiresAt) {
            console.log('[useAuthHandler] Found token and expiresAt, processing login');
            // Lưu vào localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("expiresAt", expiresAt);
            if (role) localStorage.setItem("role", role);
            if (username) localStorage.setItem("username", username);

            // Cập nhật context - sửa lại để truyền đúng tham số
            login(token, { token, expiresAt, role, username: username || "" });

            // Xóa token khỏi URL và chuyển về trang chủ hoặc trang trước đó
            params.delete("token");
            params.delete("expiresAt");
            params.delete("role");
            params.delete("username");
            navigate(location.pathname, { replace: true });
        }
    }, [location, login, navigate]);
};