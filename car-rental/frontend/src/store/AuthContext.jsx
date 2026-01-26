// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { logout } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Provide default values to prevent undefined context errors
const defaultContextValue = {
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    isLoading: true
};

export const AuthContext = createContext(defaultContextValue);

export const AuthProvider = ({ children }) => {
    // Lấy username và role từ localStorage khi khởi tạo
    const [user, setUser] = useState(() => {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        return username ? { username, role } : null;
    });
    // Lấy token từ localStorage trước, nếu không có thì lấy từ sessionStorage
    const getInitialToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };
    const [token, setToken] = useState(getInitialToken());
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check token validity on mount
        const checkToken = () => {
            // Lấy token từ localStorage trước, nếu không có thì lấy từ sessionStorage
            const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
            const expiresAt = localStorage.getItem('expiresAt');
            const role = localStorage.getItem('role');
            const username = localStorage.getItem('username');

            console.log('[AuthContext] Checking token validity:');
            console.log('[AuthContext] storedToken:', storedToken ? 'Có' : 'Không có');
            console.log('[AuthContext] expiresAt:', expiresAt);
            console.log('[AuthContext] role:', role);
            console.log('[AuthContext] username:', username);
            console.log('[AuthContext] Current time:', new Date().toISOString());
            console.log('[AuthContext] ExpiresAt time:', expiresAt ? new Date(parseInt(expiresAt, 10)).toISOString() : 'Không có');

            if (storedToken && expiresAt && new Date(parseInt(expiresAt, 10)) > new Date()) {
                console.log('[AuthContext] Token is valid, setting user');
                setToken(storedToken);
                setUser({
                    username: username || null,
                    role: role || null,
                });
            } else {
                console.log('[AuthContext] Token is invalid or expired, clearing only auth data');
                // Chỉ xóa dữ liệu authentication, giữ lại username
                localStorage.removeItem('token');
                localStorage.removeItem('expiresAt');
                localStorage.removeItem('role');
                // KHÔNG xóa username: localStorage.removeItem('username');
                setToken(null);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkToken();
    }, []);

    const login = (newToken, userData) => {
        console.log('[AuthContext] Login called with:', { 
            newToken: newToken ? 'Có' : 'Không có', 
            userData,
            newTokenLength: newToken ? newToken.length : 0
        });
        setToken(newToken);
        const userInfo = {
            username: userData.username || null,
            role: userData.role || null,
        };
        setUser(userInfo);

        if (newToken) {
            // Nếu có userData.rememberMe thì lưu vào localStorage, ngược lại lưu vào sessionStorage
            if (userData && userData.rememberMe) {
                localStorage.setItem('token', newToken);
                sessionStorage.removeItem('token');
            } else {
                sessionStorage.setItem('token', newToken);
                localStorage.removeItem('token');
            }
            if (userData.expiresAt) localStorage.setItem('expiresAt', userData.expiresAt);
            if (userData.role) localStorage.setItem('role', userData.role);
            if (userData.username) localStorage.setItem('username', userData.username);
            console.log('[AuthContext] Saved token:', {
                where: userData && userData.rememberMe ? 'localStorage' : 'sessionStorage',
                expiresAt: userData.expiresAt,
                role: userData.role,
                username: userData.username
            });
        } else {
            console.log('[AuthContext] No token provided, not saving');
        }
    };

    const logoutHandler = async () => {
        console.log('[AuthContext] Logout called');
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            console.log('[AuthContext] Cleared all auth data');
            navigate('/');
        }
    };

    const isTokenExpired = () => {
        const expiresAt = localStorage.getItem('expiresAt');
        if (!expiresAt) {
            console.log('[AuthContext] isTokenExpired: No expiresAt found');
            return true;
        }
        const isExpired = Date.now() > parseInt(expiresAt, 10);
        console.log('[AuthContext] isTokenExpired:', isExpired, 'Current:', Date.now(), 'ExpiresAt:', parseInt(expiresAt, 10));
        return isExpired;
    };

    const isAuthenticated = !!token && !isTokenExpired();
    
    console.log('[AuthContext] Current state:', {
        token: token ? 'Có' : 'Không có',
        user: user,
        isAuthenticated: isAuthenticated,
        isLoading: isLoading
    });

    // Always render the provider, never return null
    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            logout: logoutHandler,
            isAuthenticated: isAuthenticated,
            isLoading: isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;