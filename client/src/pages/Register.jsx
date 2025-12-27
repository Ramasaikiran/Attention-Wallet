import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        mobile: '',
        pin: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { mobile, pin } = formData;

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
            await api.post('/auth/register', { mobile, pin });
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
            <p>Register with your Mobile Number to manage the wallet.</p>
            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={onSubmit}>
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
                    {loading ? 'Register' : 'Register'}
                </button>
            </form>
            <p className="mt-2 text-center">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;
