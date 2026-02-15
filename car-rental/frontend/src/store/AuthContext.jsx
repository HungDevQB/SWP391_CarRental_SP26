import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { logout } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    isLoading: true
});

// Helper: read auth from localStorage
const readAuth = () => {
    const token = localStorage.getItem('token');
    const expiresAt = parseInt(localStorage.getItem('expiresAt') || '0', 10);
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const valid = !!token && expiresAt > Date.now();
    return {
        token: valid ? token : null,
        user: valid && username ? { username, role } : null,
        valid,
    };
};

// Helper: clear auth from localStorage
const clearLocalAuth = () => {
    ['token', 'expiresAt', 'role', 'username', 'userId'].forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
    });
};

export const AuthProvider = ({ children }) => {
    const initial = readAuth();
    const [token, setToken] = useState(initial.token);
    const [user, setUser] = useState(initial.user);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Validate on mount (handles page refresh)
    useEffect(() => {
        const { token: t, user: u, valid } = readAuth();
        if (valid) {
            setToken(t);
            setUser(u);
        } else {
            clearLocalAuth();
            setToken(null);
            setUser(null);
        }
        setIsLoading(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback((newToken, userData) => {
        if (!newToken) return;
        const expiresAt = userData.expiresAt;
        localStorage.setItem('token', newToken);
        if (expiresAt) localStorage.setItem('expiresAt', String(expiresAt));
        if (userData.role) localStorage.setItem('role', userData.role);
        if (userData.username) localStorage.setItem('username', userData.username);
        if (userData.userId) localStorage.setItem('userId', String(userData.userId));
        setToken(newToken);
        setUser({ username: userData.username || null, role: userData.role || null });
    }, []);

    const logoutHandler = useCallback(async () => {
        try { await logout(); } catch (_) {}
        clearLocalAuth();
        setToken(null);
        setUser(null);
        navigate('/');
    }, [navigate]);

    // isAuthenticated: dual-check React state AND localStorage
    const expiresAt = parseInt(localStorage.getItem('expiresAt') || '0', 10);
    const isAuthenticated = !!(token || localStorage.getItem('token')) &&
        expiresAt > Date.now();

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout: logoutHandler,
            isAuthenticated,
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
