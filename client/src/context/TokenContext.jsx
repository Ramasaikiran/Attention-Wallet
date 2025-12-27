import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const TokenContext = createContext();

export const useTokens = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    const [stats, setStats] = useState({ earnedToday: 0, spentToday: 0, history: [] });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/stats');
            setBalance(res.data.balance);
            setStats({
                earnedToday: res.data.earnedToday,
                spentToday: res.data.spentToday,
                history: res.data.history
            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch stats", err);
            if (err.response && err.response.status === 401) {
                // Token invalid/expired
                localStorage.removeItem('token');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const refreshStats = () => fetchStats();

    return (
        <TokenContext.Provider value={{ balance, stats, loading, refreshStats }}>
            {children}
        </TokenContext.Provider>
    );
};
