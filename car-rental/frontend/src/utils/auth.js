export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
};

export const getExpiresAt = () => {
    return localStorage.getItem('expiresAt');
};

export const setExpiresAt = (expiresAt) => {
    localStorage.setItem('expiresAt', expiresAt);
};

export const removeExpiresAt = () => {
    localStorage.removeItem('expiresAt');
};

export const isTokenExpired = () => {
    const expiresAt = getExpiresAt();
    return !expiresAt || new Date().getTime() > parseInt(expiresAt, 10);
};

export function getItem(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
} 
