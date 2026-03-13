import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('exagram_token'));
    const [adminToken, setAdminToken] = useState(localStorage.getItem('exagram_admin_token'));

    const api = axios.create({
        baseURL: API_URL,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    const adminApi = axios.create({
        baseURL: API_URL,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
    });

    const fetchUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('exagram_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('exagram_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (email, password, name) => {
        const response = await axios.post(`${API_URL}/auth/register`, { email, password, name });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('exagram_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('exagram_token');
        setToken(null);
        setUser(null);
    };

    const adminLogin = async (email, password) => {
        const response = await axios.post(`${API_URL}/admin/login`, { email, password });
        const { token: newToken, admin: adminData } = response.data;
        localStorage.setItem('exagram_admin_token', newToken);
        setAdminToken(newToken);
        setAdmin(adminData);
        return adminData;
    };

    const adminLogout = () => {
        localStorage.removeItem('exagram_admin_token');
        setAdminToken(null);
        setAdmin(null);
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    const grantConsent = async (type, ipAddress, userAgent) => {
        const response = await api.post('/consent/grant', { type, ip_address: ipAddress, user_agent: userAgent });
        await fetchUser();
        return response.data;
    };

    const getConsentStatus = async () => {
        const response = await api.get('/consent/status');
        return response.data;
    };

    const value = {
        user,
        admin,
        loading,
        token,
        adminToken,
        api,
        adminApi,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        refreshUser,
        grantConsent,
        getConsentStatus,
        isAuthenticated: !!user,
        isAdmin: !!admin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
