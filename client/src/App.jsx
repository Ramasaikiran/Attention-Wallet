import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTokens } from './context/TokenContext';
import Dashboard from './pages/Dashboard';
import Earn from './pages/Earn';
import Spend from './pages/Spend';
import Login from './pages/Login';
import Register from './pages/Register';

const Navbar = () => {
  const { balance } = useTokens();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">Attention Wallet</div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/earn" className={location.pathname === '/earn' ? 'active' : ''}>Earn</Link>
        <Link to="/spend" className={location.pathname === '/spend' ? 'active' : ''}>Spend</Link>
      </div>
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="nav-balance">
          💰 {balance}
        </div>
        {!token ? (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem' }}>Login</Link>
        ) : (
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', border: '1px solid #ccc', color: '#333' }}>Logout</button>
        )}
      </div>
    </nav>
  );
};

import ProtectedRoute from './components/ProtectedRoute';

// ... (existing imports)

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/earn" element={
              <ProtectedRoute>
                <Earn />
              </ProtectedRoute>
            } />
            <Route path="/spend" element={
              <ProtectedRoute>
                <Spend />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
