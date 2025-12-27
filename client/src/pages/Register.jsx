import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        pin: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { username, password, pin } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (pin.length < 4) {
            setError('Parent PIN must be at least 4 digits');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', { username, password, pin });
            // For now, redirect to login or home. Let's go to Login.
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page card">
            <h2>Parent Registration</h2>
            <p>Create an account to manage the wallet and set your Approval PIN.</p>
            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password (for Login)</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Parent PIN (for Approval)</label>
                    <small>This is the 4-digit code you will use to approve activities.</small>
                    <input
                        type="password"
                        name="pin"
                        value={pin}
                        onChange={onChange}
                        placeholder="e.g. 5555"
                        maxLength="6"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="mt-2 text-center">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;
