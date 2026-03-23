// src/components/AuthHandler.jsx
import { useEffect, useRef } from 'react'; // Thêm useRef
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import {useAuthHandler} from "@/hooks/useAuthHandler.js";

export const AuthHandler = () => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const prevPathRef = useRef(location.pathname);

    useAuthHandler();

    useEffect(() => {
        // Nếu người dùng đã đăng nhập và đang ở trang login/register
        if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/register")) {
            // Chuyển hướng về trang chủ hoặc trang trước đó
            navigate(prevPathRef.current === "/login" || prevPathRef.current === "/register" ? "/" : prevPathRef.current);
        }

        // Lưu lại đường dẫn hiện tại
        prevPathRef.current = location.pathname;
    }, [isAuthenticated, location.pathname, navigate]);

    return null;
};
export default AuthHandler;