import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/login/otp', { mobile });
            setStep('otp');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login/verify', { mobile, otp });
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page card">
            <h2>Parent Login</h2>
            <p>Login securely with OTP.</p>
            {error && <p className="error-msg">{error}</p>}

            {step === 'mobile' ? (
                <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="e.g. 9876543210"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Get OTP'}
                    </button>
                    <p className="mt-2 text-center">
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Enter OTP</label>
                        <small>Check the server console for the code (Simulation)</small>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit code"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary full-width mt-2"
                        onClick={() => setStep('mobile')}
                    >
                        Back
                    </button>
                </form>
            )}
        </div>
    );
};

export default Login;
