import React, { createContext, useState, useEffect } from 'react';
import {getMe, logoutApi} from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const user = await getMe();
                    console.log(user);
                    setUser(user);
                } catch (error) {
                    console.error('Błąd pobierania usera', error);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const logout = async () => {
        try {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setToken('');
                setUser(null);
                return;
            }

            const data = await logoutApi();
            if (data && data.message) {
                console.log('Server response logout:', data.message);
            }
        } catch (error) {
            console.error('logoutApi error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken('');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
