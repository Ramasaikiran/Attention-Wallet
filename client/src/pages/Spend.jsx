import React, { useState } from 'react';
import api from '../api';
import { useTokens } from '../context/TokenContext';
import { useNavigate } from 'react-router-dom';

const apps = [
    { name: 'YouTube', icon: '📺', costPerMin: 5 },
    { name: 'Instagram', icon: '📷', costPerMin: 4 },
    { name: 'Video Games', icon: '🎮', costPerMin: 3 },
    { name: 'Learning App', icon: '🧠', costPerMin: 1 },
];

const Spend = () => {
    const { balance, refreshStats } = useTokens();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [minutes, setMinutes] = useState(15);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cost = selected ? minutes * apps.find(a => a.name === selected).costPerMin : 0;
    const canAfford = balance >= cost;

    const handleSpend = async () => {
        if (!selected) return;
        // Client-side check only for UI feedback. Server is authority.
        if (balance < cost) {
            setError("Not enough tokens!");
            return;
        }

        setLoading(true);
        try {
            await api.post('/spend', {
                category: selected,
                minutes: minutes
            });
            await refreshStats();
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="spend-page">
            <header>
                <h2>Spend Your Tokens</h2>
                <p>Choose an app to "buy" screen time.</p>
                <div className={`wallet-badge ${canAfford ? 'good' : 'bad'}`}>
                    Available: {balance}
                </div>
            </header>

            <div className="apps-grid">
                {apps.map(app => (
                    <div
                        key={app.name}
                        className={`card app-card ${selected === app.name ? 'selected' : ''}`}
                        onClick={() => { setSelected(app.name); setError(''); }}
                    >
                        <div className="icon">{app.icon}</div>
                        <h3>{app.name}</h3>
                        <p className="cost">{app.costPerMin} Tokens / min</p>
                    </div>
                ))}
            </div>

            {selected && (
                <div className="purchase-panel card animate-slide-up">
                    <h3>Purchase {selected} Time</h3>

                    <div className="time-selector">
                        {[15, 30, 45, 60].map(m => (
                            <button
                                key={m}
                                className={`time-btn ${minutes === m ? 'active' : ''}`}
                                onClick={() => setMinutes(m)}
                            >
                                {m} Min
                            </button>
                        ))}
                    </div>

                    <div className="receipt">
                        <div className="line-item">
                            <span>Cost per minute</span>
                            <span>{apps.find(a => a.name === selected).costPerMin}</span>
                        </div>
                        <div className="line-item">
                            <span>Duration</span>
                            <span>{minutes} min</span>
                        </div>
                        <div className="line-item total">
                            <span>Total Cost</span>
                            <span>{cost} Tokens</span>
                        </div>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button
                        className="btn btn-danger full-width"
                        onClick={handleSpend}
                        disabled={loading || !canAfford}
                    >
                        {loading ? 'Processing...' : (canAfford ? 'Confirm Purchase' : 'Insufficient Funds')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Spend;
