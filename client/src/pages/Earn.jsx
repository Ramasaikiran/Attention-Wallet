import React, { useState } from 'react';
import api from '../api';
import { useTokens } from '../context/TokenContext';
import { useNavigate } from 'react-router-dom';

const activities = [
    { name: 'Reading', icon: '📚', rate: 10, unit: 'per hour' }, // Simplified: user inputs raw amount or duration? Let's do duration -> calc
    { name: 'Exercise', icon: '🏃', rate: 15, unit: 'per hour' },
    { name: 'Homework', icon: '📝', rate: 20, unit: 'per hour' },
    { name: 'Family Time', icon: '👨‍👩‍👧‍👦', rate: 10, unit: 'per hour' },
];

const Earn = () => {
    const { refreshStats } = useTokens();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [minutes, setMinutes] = useState('');
    const [loading, setLoading] = useState(false);

    const [password, setPassword] = useState('');

    const handleEarn = async () => {
        if (!selected || !minutes) return;
        if (password.length < 4) {
            alert("Please enter a valid Parent PIN (min 4 chars)");
            return;
        }

        setLoading(true);
        try {
            await api.post('/earn', {
                category: selected,
                minutes: parseInt(minutes),
                password: password
            });
            await refreshStats();
            navigate('/');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error earning tokens');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="earn-page">
            <h2>Start a Healthy Habit</h2>
            <p>Select an activity to log and earn tokens!</p>

            <div className="activity-grid">
                {activities.map(act => (
                    <div
                        key={act.name}
                        className={`card activity-card ${selected === act.name ? 'selected' : ''}`}
                        onClick={() => setSelected(act.name)}
                    >
                        <div className="icon">{act.icon}</div>
                        <h3>{act.name}</h3>
                        <p>{act.rate} Tokens / hr</p>
                    </div>
                ))}
            </div>

            {selected && (
                <div className="log-panel card animate-slide-up">
                    <h3>Log {selected}</h3>
                    <div className="form-group">
                        <label>How many minutes?</label>
                        <input
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            placeholder="e.g. 30"
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label>Parent Approval PIN</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Parent PIN"
                            className="password-input"
                        />
                    </div>

                    {minutes && (
                        <div className="preview-earn">
                            You will earn approx <strong>{Math.ceil((parseInt(minutes) / 60) * activities.find(a => a.name === selected).rate)} tokens</strong>
                        </div>
                    )}

                    <button className="btn btn-primary full-width" onClick={handleEarn} disabled={loading}>
                        {loading ? 'Processing...' : 'Claim Tokens!'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Earn;
