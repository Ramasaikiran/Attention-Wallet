import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        mobile: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { mobile, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { mobile, password });
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page card">
            <h2>Parent Login</h2>
            <p>Welcome back! Please login.</p>
            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        value={mobile}
                        onChange={onChange}
                        placeholder="e.g. 9876543210"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p className="mt-2 text-center">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
