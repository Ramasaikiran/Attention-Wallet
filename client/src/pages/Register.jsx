import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP & Details
    const [formData, setFormData] = useState({
        mobile: '',
        otp: '',
        password: '',
        confirmPassword: '',
        pin: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { mobile, otp, password, confirmPassword, pin } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const sendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register/otp', { mobile });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (pin.length < 4) {
            setError('Parent PIN must be at least 4 digits');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', { mobile, otp, password, pin });
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
            <p>Step {step} of 2</p>
            {error && <p className="error-msg">{error}</p>}

            {step === 1 ? (
                <form onSubmit={sendOtp}>
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
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Verify Mobile'}
                    </button>
                    <p className="mt-2 text-center">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            ) : (
                <form onSubmit={register}>
                    <div className="form-group">
                        <label>Enter OTP from Server Logs</label>
                        <input
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={onChange}
                            placeholder="6-digit OTP"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Set Password (for Login)</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Set Parent PIN</label>
                        <small>4-digit PIN for approving claims.</small>
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
                    <button
                        type="button"
                        className="btn btn-secondary full-width mt-2"
                        onClick={() => setStep(1)}
                    >
                        Back
                    </button>
                </form>
            )}
        </div>
    );
};

export default Register;
