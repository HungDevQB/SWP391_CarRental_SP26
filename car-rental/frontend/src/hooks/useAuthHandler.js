import { useEffect, useRef } from "react";
import { useAuth } from "../store/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthHandler = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handled = useRef(false);

    useEffect(() => {
        // Only handle Google OAuth callback (URL has token + expiresAt params)
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const expiresAt = params.get("expiresAt");

        if (token && expiresAt && !handled.current) {
            handled.current = true;
            const role = params.get("role") || "customer";
            const username = params.get("username") || "";
            login(token, { token, expiresAt: parseInt(expiresAt, 10), role, username });
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps
};
